from typing import Optional

from pydantic import BaseModel


class GenerateSQLRequestDTO(BaseModel):
    user_query: str
    schema_context: str = ""


class GenerateSQLResponseDTO(BaseModel):
    query_log_id: str
    user_query: str
    generated_sql: str
    status: str


class ColumnInfoDTO(BaseModel):
    name: str
    type: str
    nullable: bool
    primary_key: bool
    default: Optional[str] = None


class TableInfoDTO(BaseModel):
    name: str
    columns: list[ColumnInfoDTO]


class DatabaseInfoDTO(BaseModel):
    connected: bool
    database_url: str
    database_type: str
    tables_count: int


class TablesListDTO(BaseModel):
    tables: list[str]


class SchemaContextDTO(BaseModel):
    context: str
