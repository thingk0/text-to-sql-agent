from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from agent.infrastructure.database.schema_service import SchemaService, get_schema_service
from agent.presentation.api.schemas import (
    CreateTableRequestDTO,
    DatabaseInfoDTO,
    SchemaContextDTO,
    TableInfoDTO,
    TablesListDTO,
)

router = APIRouter(prefix="/api/database", tags=["Database"])


@router.get("/connection", response_model=DatabaseInfoDTO)
def get_connection_info(
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """데이터베이스 연결 정보를 반환합니다."""
    return service.get_connection_info()


@router.get("/tables", response_model=TablesListDTO)
def get_tables(
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """테이블 목록을 반환합니다."""
    return TablesListDTO(tables=service.get_tables())


@router.get("/tables/{table_name}", response_model=TableInfoDTO)
def get_table_info(
    table_name: str,
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """테이블 상세 정보를 반환합니다."""
    table_info = service.get_table_info(table_name)

    if not table_info:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")

    return table_info


@router.get("/schema-context", response_model=SchemaContextDTO)
def get_schema_context(
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """LLM에 전달할 스키마 컨텍스트를 반환합니다."""
    return SchemaContextDTO(context=service.get_schema_context())


@router.post("/tables", status_code=201)
def create_table(
    request: CreateTableRequestDTO,
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """새로운 테이블을 생성합니다."""
    try:
        service.create_table(request)
        return {"message": f"Table '{request.table_name}' created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

