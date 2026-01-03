from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.sqlite import CHAR

from agent.domain.entities.query_log import QueryLogStatus
from agent.infrastructure.database.connection import Base


class QueryLogModel(Base):
    """QueryLog 엔티티의 SQLAlchemy 모델."""

    __tablename__ = "query_logs"

    id = Column(CHAR(36), primary_key=True)
    user_query = Column(Text, nullable=False)
    generated_sql = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default=QueryLogStatus.PENDING.value)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

