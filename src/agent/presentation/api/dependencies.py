from typing import Generator

from sqlalchemy.orm import Session

from agent.infrastructure.database.connection import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """FastAPI 의존성: 데이터베이스 세션 제공."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
