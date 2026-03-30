import bcrypt
from jose import jwt
from datetime import datetime, timedelta
import os


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


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
