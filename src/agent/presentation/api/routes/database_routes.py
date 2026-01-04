from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from agent.infrastructure.database.schema_service import SchemaService, get_schema_service
from agent.presentation.api.schemas import (
    AddColumnRequestDTO,
    CreateTableRequestDTO,
    DatabaseInfoDTO,
    RenameTableRequestDTO,
    SchemaContextDTO,
    TableDataDTO,
    TableInfoDTO,
    TablesListDTO,
    InsertRowRequestDTO,
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


@router.delete("/tables/{table_name}", status_code=200)
def delete_table(
    table_name: str,
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """테이블을 삭제합니다."""
    try:
        service.drop_table(table_name)
        return {"message": f"Table '{table_name}' deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/tables/{table_name}", status_code=200)
def rename_table(
    table_name: str,
    request: RenameTableRequestDTO,
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """테이블 이름을 변경합니다."""
    try:
        service.rename_table(table_name, request.new_name)
        return {"message": f"Table renamed from '{table_name}' to '{request.new_name}'"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/tables/{table_name}/columns", status_code=201)
def add_column(
    table_name: str,
    request: AddColumnRequestDTO,
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """테이블에 컬럼을 추가합니다."""
    try:
        service.add_column(table_name, request.column)
        return {"message": f"Column '{request.column.name}' added to '{table_name}'"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/tables/{table_name}/columns/{column_name}", status_code=200)
def drop_column(
    table_name: str,
    column_name: str,
    service: Annotated[SchemaService, Depends(get_schema_service)],
):
    """테이블에서 컬럼을 삭제합니다."""
    try:
        service.drop_column(table_name, column_name)
        return {"message": f"Column '{column_name}' dropped from '{table_name}'"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tables/{table_name}/data", response_model=TableDataDTO)
def get_table_data(
    table_name: str,
    limit: int = 100,
    offset: int = 0,
    service: Annotated[SchemaService, Depends(get_schema_service)] = None,
):
    """테이블의 데이터를 반환합니다."""
    try:
        return service.get_table_data(table_name, limit, offset)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/tables/{table_name}/rows", status_code=201)
def add_row(
    table_name: str,
    request: InsertRowRequestDTO,
    service: Annotated[SchemaService, Depends(get_schema_service)] = None,
):
    """테이블에 새로운 행을 추가합니다."""
    try:
        service.add_row(table_name, request.data)
        return {"message": "Row added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
