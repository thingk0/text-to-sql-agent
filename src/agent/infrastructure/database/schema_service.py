from typing import Annotated, Optional

from fastapi import Depends
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from agent.infrastructure.database.connection import Base, get_engine
from agent.presentation.api.schemas import (
    ColumnDefinitionDTO,
    ColumnInfoDTO,
    CreateTableRequestDTO,
    DatabaseInfoDTO,
    TableDataDTO,
    TableInfoDTO,
)


class SchemaService:
    """데이터베이스 스키마 조회 서비스."""

    def __init__(self, db_engine: Engine, schema_indexer=None):
        self._engine = db_engine
        self._indexer = schema_indexer

    def set_indexer(self, indexer) -> None:
        """스키마 인덱서를 설정합니다 (순환 의존성 방지용)."""
        self._indexer = indexer

    def _trigger_index(self, table_name: str) -> None:
        """테이블 인덱스를 갱신합니다."""
        if self._indexer:
            try:
                self._indexer.index_table(table_name)
            except Exception as e:
                print(f"[RAG] Index update failed for {table_name}: {e}")

    def _trigger_remove(self, table_name: str) -> None:
        """테이블 인덱스를 제거합니다."""
        if self._indexer:
            try:
                self._indexer.remove_table(table_name)
            except Exception as e:
                print(f"[RAG] Index removal failed for {table_name}: {e}")

    @property
    def _internal_tables(self) -> set[str]:
        """Base에 등록된 모든 SQLAlchemy 모델의 테이블명을 반환."""
        return set(Base.metadata.tables.keys())

    def get_connection_info(self) -> DatabaseInfoDTO:
        """데이터베이스 연결 정보를 반환합니다."""
        try:
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            inspector = inspect(self._engine)
            tables = [t for t in inspector.get_table_names() if t not in self._internal_tables]

            return DatabaseInfoDTO(
                connected=True,
                database_url=str(self._engine.url),
                database_type=self._engine.dialect.name,
                tables_count=len(tables),
            )
        except Exception:
            return DatabaseInfoDTO(
                connected=False,
                database_url=str(self._engine.url),
                database_type=self._engine.dialect.name,
                tables_count=0,
            )

    def get_tables(self) -> list[str]:
        """테이블 목록을 반환합니다 (내부 시스템 테이블 제외)."""
        inspector = inspect(self._engine)
        return [t for t in inspector.get_table_names() if t not in self._internal_tables]

    def get_table_info(self, table_name: str) -> Optional[TableInfoDTO]:
        """테이블 상세 정보를 반환합니다."""
        inspector = inspect(self._engine)

        if table_name not in inspector.get_table_names():
            return None

        columns = []
        pk_columns = inspector.get_pk_constraint(table_name).get("constrained_columns", [])

        for col in inspector.get_columns(table_name):
            columns.append(
                ColumnInfoDTO(
                    name=col["name"],
                    type=str(col["type"]),
                    nullable=col.get("nullable", True),
                    primary_key=col["name"] in pk_columns,
                    default=str(col.get("default")) if col.get("default") else None,
                )
            )

        return TableInfoDTO(name=table_name, columns=columns)

    def get_schema_context(self) -> str:
        """LLM에 전달할 스키마 컨텍스트 문자열을 생성합니다."""
        tables = self.get_tables()
        if not tables:
            return "No tables found in database."

        context_lines = []
        for table_name in tables:
            table_info = self.get_table_info(table_name)
            if table_info:
                columns_str = ", ".join(
                    f"{col.name} ({col.type}{'*' if col.primary_key else ''})"
                    for col in table_info.columns
                )
                context_lines.append(f"- {table_name}: {columns_str}")

        return "Tables:\n" + "\n".join(context_lines)

    def create_table(self, request: CreateTableRequestDTO) -> None:
        """새로운 테이블을 생성합니다."""
        column_defs = []
        fk_constraints = []

        for col in request.columns:
            parts = [f"{col.name} {col.type}"]
            if col.is_primary_key:
                parts.append("PRIMARY KEY")
            if not col.is_nullable:
                parts.append("NOT NULL")
            if col.is_unique:
                parts.append("UNIQUE")
            if col.default_value:
                parts.append(f"DEFAULT '{col.default_value}'")
            column_defs.append(" ".join(parts))

            if col.fk_reference:
                fk_constraints.append(
                    f"FOREIGN KEY ({col.name}) REFERENCES {col.fk_reference.table}({col.fk_reference.column})"
                )

        all_defs = column_defs + fk_constraints
        sql = f"CREATE TABLE {request.table_name} (\n    " + ",\n    ".join(all_defs) + "\n)"

        with self._engine.begin() as conn:
            conn.execute(text(sql))
        
        self._trigger_index(request.table_name)

    def drop_table(self, table_name: str) -> None:
        """테이블을 삭제합니다."""
        if table_name in self._internal_tables:
            raise ValueError(f"시스템 테이블 '{table_name}'은(는) 삭제할 수 없습니다.")

        sql = f"DROP TABLE IF EXISTS {table_name}"
        with self._engine.begin() as conn:
            conn.execute(text(sql))
        
        self._trigger_remove(table_name)

    def rename_table(self, old_name: str, new_name: str) -> None:
        """테이블 이름을 변경합니다."""
        if old_name in self._internal_tables:
            raise ValueError(f"시스템 테이블 '{old_name}'은(는) 이름을 변경할 수 없습니다.")

        sql = f"ALTER TABLE {old_name} RENAME TO {new_name}"
        with self._engine.begin() as conn:
            conn.execute(text(sql))
        
        self._trigger_remove(old_name)
        self._trigger_index(new_name)

    def add_column(self, table_name: str, column: ColumnDefinitionDTO) -> None:
        """테이블에 컬럼을 추가합니다."""
        if table_name in self._internal_tables:
            raise ValueError(f"시스템 테이블 '{table_name}'은(는) 수정할 수 없습니다.")

        parts = [f"ALTER TABLE {table_name} ADD COLUMN {column.name} {column.type}"]
        if not column.is_nullable:
            parts.append("NOT NULL")
        if column.default_value:
            parts.append(f"DEFAULT '{column.default_value}'")

        sql = " ".join(parts)
        with self._engine.begin() as conn:
            conn.execute(text(sql))
        
        self._trigger_index(table_name)

    def drop_column(self, table_name: str, column_name: str) -> None:
        """테이블에서 컬럼을 삭제합니다."""
        if table_name in self._internal_tables:
            raise ValueError(f"시스템 테이블 '{table_name}'은(는) 수정할 수 없습니다.")

        sql = f"ALTER TABLE {table_name} DROP COLUMN {column_name}"
        with self._engine.begin() as conn:
            conn.execute(text(sql))
        
        self._trigger_index(table_name)

    def get_table_data(self, table_name: str, limit: int = 100, offset: int = 0) -> TableDataDTO:
        """테이블의 데이터를 조회합니다."""
        if table_name in self._internal_tables:
            raise ValueError(f"시스템 테이블 '{table_name}'은(는) 조회할 수 없습니다.")

        sql = f"SELECT * FROM {table_name} LIMIT :limit OFFSET :offset"
        with self._engine.connect() as conn:
            result = conn.execute(text(sql), {"limit": limit, "offset": offset})
            columns = list(result.keys())
            rows = [dict(row._mapping) for row in result]

        return TableDataDTO(columns=columns, rows=rows)

    def add_row(self, table_name: str, data: dict) -> None:
        """테이블에 새로운 행을 추가합니다."""
        if table_name in self._internal_tables:
            raise ValueError(f"시스템 테이블 '{table_name}'은(는) 수정할 수 없습니다.")

        cols = ", ".join(data.keys())
        placeholders = ", ".join([f":{k}" for k in data.keys()])
        sql = f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})"

        with self._engine.begin() as conn:
            conn.execute(text(sql), data)


def get_schema_service(db_engine: Annotated[Engine, Depends(get_engine)]) -> SchemaService:
    return SchemaService(db_engine)

