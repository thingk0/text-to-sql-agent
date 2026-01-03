import re
from typing import Optional

from pydantic import BaseModel, field_validator


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


class ColumnDefinitionDTO(BaseModel):
    name: str
    type: str
    is_primary_key: bool = False
    is_nullable: bool = True
    default_value: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", v):
            raise ValueError(
                "컬럼명은 영문자나 언더바(_)로 시작해야 하며, 영문자, 숫자, 언더바만 포함할 수 있습니다."
            )
        return v


class CreateTableRequestDTO(BaseModel):
    table_name: str
    columns: list[ColumnDefinitionDTO]

    @field_validator("table_name")
    @classmethod
    def validate_table_name(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", v):
            raise ValueError(
                "테이블명은 영문자나 언더바(_)로 시작해야 하며, 영문자, 숫자, 언더바만 포함할 수 있습니다."
            )
        return v
