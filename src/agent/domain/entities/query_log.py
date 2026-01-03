from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class QueryLogStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class QueryLog:
    """도메인 엔티티: 사용자의 질의 실행 로그."""

    user_query: str  # 필수 필드 (기본값 없음)
    id: UUID = field(default_factory=uuid4)
    generated_sql: Optional[str] = None
    status: QueryLogStatus = QueryLogStatus.PENDING
    error_message: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)

    def mark_processing(self) -> None:
        self.status = QueryLogStatus.PROCESSING

    def complete(self, sql: str) -> None:
        self.generated_sql = sql
        self.status = QueryLogStatus.COMPLETED

    def fail(self, error: str) -> None:
        self.error_message = error
        self.status = QueryLogStatus.FAILED
