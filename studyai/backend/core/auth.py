from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))
    )
    return jwt.encode(
        {**data, "exp": expire},
        os.getenv("JWT_SECRET"),
        algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        os.getenv("JWT_SECRET"),
        algorithms=[os.getenv("JWT_ALGORITHM", "HS256")],
    )
