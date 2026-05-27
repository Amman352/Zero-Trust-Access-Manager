import pyotp
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.models.audit_log import AuditLog, AuditAction


class MFAService:

    def generate_setup(self, user: User) -> dict:
        """Generate TOTP secret and QR URI for Google Authenticator."""
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        qr_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="Zero Trust Access Manager"
        )
        # Generate 8 backup codes
        backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
        return {
            "secret": secret,
            "qr_uri": qr_uri,
            "backup_codes": backup_codes,
        }

    def verify_totp(self, secret: str, code: str) -> bool:
        """Verify a 6-digit TOTP code. Allows 1 window drift."""
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=1)

    async def enable_mfa(
        self, db: AsyncSession, user: User, secret: str, code: str
    ) -> bool:
        """Enable MFA after verifying the first code."""
        if not self.verify_totp(secret, code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TOTP code. Please try again."
            )
        user.mfa_enabled = True
        user.mfa_secret = secret
        db.add(user)
        db.add(AuditLog(
            user_id=user.id,
            action=AuditAction.MFA_ENABLED,
            extra_metadata={"method": "totp"}
        ))
        await db.commit()
        return True

    async def disable_mfa(
        self, db: AsyncSession, user: User, code: str
    ) -> bool:
        """Disable MFA after verifying current code."""
        if not user.mfa_enabled or not user.mfa_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA is not enabled"
            )
        if not self.verify_totp(user.mfa_secret, code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TOTP code"
            )
        user.mfa_enabled = False
        user.mfa_secret = None
        db.add(user)
        db.add(AuditLog(
            user_id=user.id,
            action=AuditAction.MFA_DISABLED,
            extra_metadata={"method": "totp"}
        ))
        await db.commit()
        return True


mfa_service = MFAService()