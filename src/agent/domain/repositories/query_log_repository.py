from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from agent.domain.entities.query_log import QueryLog


class QueryLogRepository(ABC):
    """QueryLog 엔티티를 위한 리포지토리 인터페이스."""

    @abstractmethod
    def save(self, query_log: QueryLog) -> QueryLog:
        """QueryLog를 저장합니다."""
        pass

    @abstractmethod
    def find_by_id(self, id: UUID) -> Optional[QueryLog]:
        """ID로 QueryLog를 조회합니다."""
        pass

    @abstractmethod
    def find_all(self) -> list[QueryLog]:
        """모든 QueryLog를 조회합니다."""
        pass

    @abstractmethod
    def delete(self, id: UUID) -> bool:
        """QueryLog를 삭제합니다."""
        pass

