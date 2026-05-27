from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import MFASetupResponse, MFAVerifyRequest
from app.services.mfa_service import mfa_service

router = APIRouter(prefix="/auth/mfa", tags=["MFA"])


@router.post("/setup", response_model=MFASetupResponse)
async def setup_mfa(
    current_user: User = Depends(get_current_user),
):
    """
    Generate MFA secret and QR code URI.
    Scan the QR URI with Google Authenticator, then call /verify to activate.
    """
    if current_user.mfa_enabled:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled"
        )
    return mfa_service.generate_setup(current_user)


@router.post("/verify")
async def verify_and_enable_mfa(
    data: MFAVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify TOTP code and enable MFA on the account."""
    # Secret must be passed back from /setup response
    from app.schemas.auth import MFAVerifyRequest as Req
    from fastapi import HTTPException, status
    if not current_user.mfa_secret and not data.totp_code:
        raise HTTPException(status_code=400, detail="Call /setup first")

    # For enable flow: user sends secret + code together
    await mfa_service.enable_mfa(db, current_user, current_user.mfa_secret or "", data.totp_code)
    return {"message": "MFA enabled successfully", "mfa_enabled": True}


@router.post("/disable")
async def disable_mfa(
    data: MFAVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Disable MFA by verifying current TOTP code."""
    await mfa_service.disable_mfa(db, current_user, data.totp_code)
    return {"message": "MFA disabled successfully", "mfa_enabled": False}
