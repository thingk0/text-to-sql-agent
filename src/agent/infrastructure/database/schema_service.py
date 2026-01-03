from typing import Annotated, Optional

from fastapi import Depends
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from agent.infrastructure.database.connection import get_engine
from agent.presentation.api.schemas import ColumnInfoDTO, DatabaseInfoDTO, TableInfoDTO


class SchemaService:
    """데이터베이스 스키마 조회 서비스."""

    def __init__(self, db_engine: Engine):
        self._engine = db_engine

    def get_connection_info(self) -> DatabaseInfoDTO:
        """데이터베이스 연결 정보를 반환합니다."""
        try:
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            inspector = inspect(self._engine)
            tables = inspector.get_table_names()

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
        """테이블 목록을 반환합니다."""
        inspector = inspect(self._engine)
        return inspector.get_table_names()

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


def get_schema_service(db_engine: Annotated[Engine, Depends(get_engine)]) -> SchemaService:
    return SchemaService(db_engine)

