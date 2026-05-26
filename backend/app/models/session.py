import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Token info
    access_token_jti: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    refresh_token_jti: Mapped[str] = mapped_column(String(255), unique=True, nullable=True)

    # Device & location
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)
    device_fingerprint: Mapped[str] = mapped_column(String(255), nullable=True)
    location_country: Mapped[str] = mapped_column(String(100), nullable=True)
    location_city: Mapped[str] = mapped_column(String(100), nullable=True)

    # ML scores
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    trust_score: Mapped[float] = mapped_column(Float, default=100.0)

    # State
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    mfa_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    revoke_reason: Mapped[str] = mapped_column(String(255), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    def __repr__(self):
        return f"<Session {self.id} | user={self.user_id} | active={self.is_active}>"