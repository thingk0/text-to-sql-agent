from abc import ABC, abstractmethod


class SQLGenerator(ABC):
    """SQL 생성을 위한 도메인 서비스 인터페이스."""

    @abstractmethod
    def generate(self, user_query: str, schema_context: str) -> str:
        """자연어를 SQL로 변환합니다.

        Args:
            user_query: 사용자의 자연어 질의
            schema_context: 데이터베이스 스키마 정보

        Returns:
            생성된 SQL 쿼리
        """
        pass
