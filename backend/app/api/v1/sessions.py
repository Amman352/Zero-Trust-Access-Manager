from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from typing import List
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.session import UserSession
from app.models.audit_log import AuditLog, AuditAction

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("/", response_model=List[dict])
async def list_my_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all active sessions for the current user."""
    result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.is_active == True,
        ).order_by(UserSession.created_at.desc())
    )
    sessions = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "ip_address": s.ip_address,
            "user_agent": s.user_agent,
            "device_fingerprint": s.device_fingerprint,
            "risk_score": s.risk_score,
            "trust_score": s.trust_score,
            "mfa_verified": s.mfa_verified,
            "created_at": s.created_at.isoformat(),
            "last_activity_at": s.last_activity_at.isoformat(),
            "expires_at": s.expires_at.isoformat(),
        }
        for s in sessions
    ]


@router.delete("/{session_id}")
async def revoke_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke a specific session (force logout)."""
    result = await db.execute(
        select(UserSession).where(
            UserSession.id == uuid.UUID(session_id),
            UserSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    session.is_active = False
    session.revoked_at = datetime.now(timezone.utc)
    session.revoke_reason = "user_initiated"
    db.add(session)
    db.add(AuditLog(
        user_id=current_user.id,
        action=AuditAction.SESSION_REVOKED,
        extra_metadata={"session_id": session_id}
    ))
    await db.commit()
    return {"message": "Session revoked successfully"}


@router.delete("/")
async def revoke_all_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke ALL sessions (logout everywhere)."""
    result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.is_active == True,
        )
    )
    sessions = result.scalars().all()
    for s in sessions:
        s.is_active = False
        s.revoked_at = datetime.now(timezone.utc)
        s.revoke_reason = "revoke_all"
        db.add(s)
    db.add(AuditLog(
        user_id=current_user.id,
        action=AuditAction.SESSION_REVOKED,
        extra_metadata={"revoked_count": len(sessions), "reason": "revoke_all"}
    ))
    await db.commit()
    return {"message": f"Revoked {len(sessions)} sessions"}