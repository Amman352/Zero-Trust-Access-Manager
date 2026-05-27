from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    requires_mfa: Optional[bool] = None


class TokenPayload(BaseModel):
    sub: str
    jti: str
    type: str
    role: str
    exp: int
