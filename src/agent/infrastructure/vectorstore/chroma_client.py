import chromadb
from chromadb.config import Settings

from agent.config import settings


class ChromaDBClient:
    """ChromaDB 클라이언트 - 스키마 메타데이터 벡터 저장소."""

    _instance: "ChromaDBClient | None" = None
    COLLECTION_NAME = "schema_metadata"

    def __new__(cls) -> "ChromaDBClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._initialized = True
        
        # Persistent storage path
        persist_dir = getattr(settings, 'chroma_persist_dir', './chroma_db')
        
        self._client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )
        
        self._collection = self._client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"description": "Database schema metadata for RAG"}
        )

    @property
    def collection(self):
        """Get the schema metadata collection."""
        return self._collection

    def upsert_table(self, table_name: str, document: str, metadata: dict) -> None:
        """테이블 메타데이터를 벡터 저장소에 추가/업데이트."""
        self._collection.upsert(
            ids=[table_name],
            documents=[document],
            metadatas=[metadata]
        )

    def delete_table(self, table_name: str) -> None:
        """테이블 메타데이터를 벡터 저장소에서 삭제."""
        try:
            self._collection.delete(ids=[table_name])
        except Exception:
            pass  # Ignore if not exists

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """쿼리와 유사한 테이블 메타데이터 검색."""
        results = self._collection.query(
            query_texts=[query],
            n_results=min(top_k, self._collection.count() or 1)
        )
        
        if not results["ids"] or not results["ids"][0]:
            return []
        
        tables = []
        for i, table_id in enumerate(results["ids"][0]):
            tables.append({
                "table_name": table_id,
                "document": results["documents"][0][i] if results["documents"] else "",
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                "distance": results["distances"][0][i] if results.get("distances") else 0
            })
        
        return tables

    def get_all_tables(self) -> list[str]:
        """저장된 모든 테이블 이름 반환."""
        result = self._collection.get()
        return result["ids"] if result["ids"] else []

    def clear(self) -> None:
        """컬렉션 초기화."""
        self._client.delete_collection(self.COLLECTION_NAME)
        self._collection = self._client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"description": "Database schema metadata for RAG"}
        )


def get_chroma_client() -> ChromaDBClient:
    return ChromaDBClient()
