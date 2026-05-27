import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    """List all users. Admin only."""
    result = await db.execute(select(User).where(User.is_deleted == False).order_by(User.created_at.desc()))
    return result.scalars().all()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get your own profile."""
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(data: UserUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update your own profile."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.email is not None:
        current_user.email = data.email
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    """Get a specific user by ID. Admin only."""
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
