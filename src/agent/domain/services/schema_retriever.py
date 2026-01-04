from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class RetrievedSchema:
    """검색된 스키마 정보."""
    table_name: str
    document: str
    relevance_score: float
    metadata: dict


class SchemaRetriever(ABC):
    """스키마 검색 인터페이스."""

    @abstractmethod
    def retrieve(self, query: str, top_k: int = 5) -> list[RetrievedSchema]:
        """사용자 쿼리와 관련된 스키마를 검색합니다.
        
        Args:
            query: 사용자의 자연어 질문
            top_k: 반환할 최대 테이블 수
            
        Returns:
            관련성 순으로 정렬된 스키마 목록
        """
        pass

    @abstractmethod
    def build_context(self, query: str, top_k: int = 5) -> str:
        """검색된 스키마를 LLM 컨텍스트 문자열로 변환합니다.
        
        Args:
            query: 사용자의 자연어 질문
            top_k: 사용할 최대 테이블 수
            
        Returns:
            LLM에 전달할 스키마 컨텍스트 문자열
        """
        pass
