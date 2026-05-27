from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.services.auth_service import auth_service

bearer = HTTPBearer()


# ── Get current user (any authenticated user) ─────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    return await auth_service.get_current_user(db, credentials.credentials)


# ── Require specific roles ─────────────────────────────────────────────────────
def require_roles(*roles: UserRole):
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in roles]}",
            )
        return current_user
    return role_checker


# ── Shorthand role dependencies ───────────────────────────────────────────────
require_admin = require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
require_manager = require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
require_any_user = require_roles(
    UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER,
    UserRole.USER, UserRole.VIEWER
)