import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserStatus, UserRole
from app.models.session import UserSession
from app.models.audit_log import AuditLog, AuditAction
from app.schemas.auth import RegisterRequest, LoginRequest
from app.schemas.token import Token
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from fastapi import HTTPException, status


class AuthService:

    # ── Register ──────────────────────────────────────────────────────────────
    async def register(
        self, db: AsyncSession, data: RegisterRequest, ip: str = None
    ) -> User:
        # Check email uniqueness
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Check username uniqueness
        result = await db.execute(select(User).where(User.username == data.username))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )

        user = User(
            email=data.email,
            username=data.username.lower(),
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=UserRole.USER,
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        await db.flush()

        # Audit log
        db.add(AuditLog(
            user_id=user.id,
            action=AuditAction.USER_CREATED,
            ip_address=ip,
            extra_metadata={"username": user.username, "email": user.email}
        ))
        await db.commit()
        await db.refresh(user)
        return user

    # ── Login ─────────────────────────────────────────────────────────────────
    async def login(
        self,
        db: AsyncSession,
        data: LoginRequest,
        ip: str = None,
        user_agent: str = None,
    ) -> Token:
        # Find user
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            # Log failed attempt
            if user:
                user.failed_login_attempts += 1
                db.add(AuditLog(
                    user_id=user.id,
                    action=AuditAction.LOGIN_FAILED,
                    ip_address=ip,
                    extra_metadata={"reason": "invalid_password"}
                ))
                await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if user.status == UserStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account suspended"
            )

        # Generate tokens
        access_jti = str(uuid.uuid4())
        refresh_jti = str(uuid.uuid4())
        access_token = create_access_token(str(user.id), user.role.value, access_jti)
        refresh_token = create_refresh_token(str(user.id), user.role.value, refresh_jti)

      # Calculate risk score
        from app.ml.risk_scorer import risk_scorer
        from datetime import timedelta
        risk_result = risk_scorer.score(
            failed_attempts=user.failed_login_attempts,
            mfa_enabled=user.mfa_enabled,
            user_agent=user_agent,
            is_new_device=data.device_fingerprint is None,
        )

        session = UserSession(
            user_id=user.id,
            access_token_jti=access_jti,
            refresh_token_jti=refresh_jti,
            ip_address=ip,
            user_agent=user_agent,
            device_fingerprint=data.device_fingerprint,
            risk_score=risk_result["risk_score"],
            trust_score=risk_scorer.trust_score(risk_result["risk_score"]),
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        db.add(session)

        # Update user login info
        user.last_login_at = datetime.now(timezone.utc)
        user.last_login_ip = ip
        user.failed_login_attempts = 0

        db.add(AuditLog(
            user_id=user.id,
            action=AuditAction.LOGIN_SUCCESS,
            ip_address=ip,
            user_agent=user_agent,
            extra_metadata={"session_id": str(session.id)}
        ))
        await db.commit()

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            risk_score=risk_result["risk_score"],
            risk_level=risk_result["risk_level"],
            requires_mfa=risk_result["requires_mfa"],
        )

    # ── Get current user from token ───────────────────────────────────────────
    async def get_current_user(self, db: AsyncSession, token: str) -> User:
        try:
            payload = decode_token(token)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        result = await db.execute(
            select(User).where(User.id == uuid.UUID(payload["sub"]))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user


auth_service = AuthService()