"""Schema indexer service for RAG-based SQL generation."""

from agent.infrastructure.database.schema_service import SchemaService
from agent.infrastructure.vectorstore.chroma_client import get_chroma_client, ChromaDBClient


class SchemaIndexer:
    """DB 스키마를 ChromaDB에 인덱싱하는 서비스."""

    def __init__(
        self,
        schema_service: SchemaService,
        chroma_client: ChromaDBClient | None = None
    ):
        self._schema_service = schema_service
        self._chroma = chroma_client or get_chroma_client()

    def index_all_tables(self) -> int:
        """모든 테이블을 벡터 저장소에 인덱싱합니다.
        
        Returns:
            인덱싱된 테이블 수
        """
        tables = self._schema_service.get_tables()
        indexed_count = 0

        for table_name in tables:
            table_info = self._schema_service.get_table_info(table_name)
            if table_info:
                self._index_table(table_info)
                indexed_count += 1

        return indexed_count

    def _index_table(self, table_info) -> None:
        """단일 테이블을 인덱싱합니다."""
        # 문서 생성: 테이블명과 컬럼 정보를 자연어로 표현
        columns_desc = ", ".join([
            f"{col.name} ({col.type}{'PK' if col.primary_key else ''}{'' if col.nullable else ' NOT NULL'})"
            for col in table_info.columns
        ])
        
        document = f"Table: {table_info.name}. Columns: {columns_desc}"
        
        metadata = {
            "table_name": table_info.name,
            "column_count": len(table_info.columns),
            "column_names": ",".join([c.name for c in table_info.columns]),
            "has_pk": any(c.primary_key for c in table_info.columns)
        }

        self._chroma.upsert_table(
            table_name=table_info.name,
            document=document,
            metadata=metadata
        )

    def index_table(self, table_name: str) -> bool:
        """특정 테이블을 인덱싱합니다.
        
        Args:
            table_name: 인덱싱할 테이블 이름
            
        Returns:
            성공 여부
        """
        table_info = self._schema_service.get_table_info(table_name)
        if table_info:
            self._index_table(table_info)
            return True
        return False

    def remove_table(self, table_name: str) -> None:
        """테이블을 인덱스에서 제거합니다."""
        self._chroma.delete_table(table_name)

    def reindex_all(self) -> int:
        """인덱스를 초기화하고 전체 재인덱싱합니다."""
        self._chroma.clear()
        return self.index_all_tables()

    def get_indexed_tables(self) -> list[str]:
        """인덱싱된 테이블 목록을 반환합니다."""
        return self._chroma.get_all_tables()


def get_schema_indexer(schema_service: SchemaService) -> SchemaIndexer:
    """스키마 인덱서 인스턴스를 반환합니다."""
    return SchemaIndexer(schema_service=schema_service)
