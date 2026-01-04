from typing import Annotated
from fastapi import Depends

from agent.domain.services.schema_retriever import SchemaRetriever, RetrievedSchema
from agent.infrastructure.vectorstore.chroma_client import get_chroma_client, ChromaDBClient


class ChromaSchemaRetriever(SchemaRetriever):
    """ChromaDB를 사용한 스키마 검색 구현체."""

    def __init__(self, chroma_client: ChromaDBClient):
        self._chroma = chroma_client

    def retrieve(self, query: str, top_k: int = 5) -> list[RetrievedSchema]:
        """사용자 쿼리와 관련된 스키마를 검색합니다."""
        results = self._chroma.search(query=query, top_k=top_k)
        
        return [
            RetrievedSchema(
                table_name=r["table_name"],
                document=r["document"],
                relevance_score=1 - r["distance"],
                metadata=r["metadata"]
            )
            for r in results
        ]

    def build_context(self, query: str, top_k: int = 5) -> str:
        """검색된 스키마를 LLM 컨텍스트 문자열로 변환합니다."""
        schemas = self.retrieve(query=query, top_k=top_k)
        
        if not schemas:
            return "No relevant tables found in the database."
        
        context_parts = ["Relevant tables for your query:"]
        for schema in schemas:
            context_parts.append(f"\n- {schema.document}")
        
        return "\n".join(context_parts)


def get_schema_retriever(
    chroma_client: Annotated[ChromaDBClient, Depends(get_chroma_client)]
) -> ChromaSchemaRetriever:
    return ChromaSchemaRetriever(chroma_client=chroma_client)

