from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str          # user id
    jti: str          # JWT ID (for blacklisting)
    type: str         # "access" or "refresh"
    role: str
    exp: int