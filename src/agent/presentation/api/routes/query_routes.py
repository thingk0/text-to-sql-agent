from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from agent.application.use_cases.generate_sql import (
    GenerateSQLRequest,
    GenerateSQLUseCase,
)
from agent.infrastructure.llm.langchain_client import LangChainSQLGenerator
from agent.infrastructure.repositories.sqlalchemy_query_log_repository import (
    SQLAlchemyQueryLogRepository,
)
from agent.infrastructure.vectorstore.schema_retriever import get_schema_retriever
from agent.presentation.api.dependencies import get_db
from agent.presentation.api.schemas import (
    GenerateSQLRequestDTO,
    GenerateSQLResponseDTO,
)

router = APIRouter(prefix="/api/query", tags=["Query"])


@router.post("/generate", response_model=GenerateSQLResponseDTO)
def generate_sql(
    request: GenerateSQLRequestDTO,
    db: Session = Depends(get_db),
):
    """자연어를 SQL로 변환합니다."""
    repository = SQLAlchemyQueryLogRepository(db)
    generator = LangChainSQLGenerator()
    schema_retriever = get_schema_retriever()

    use_case = GenerateSQLUseCase(
        query_log_repository=repository,
        sql_generator=generator,
        schema_retriever=schema_retriever,
    )

    try:
        result = use_case.execute(
            GenerateSQLRequest(
                user_query=request.user_query,
                schema_context=request.schema_context,
            )
        )
        return GenerateSQLResponseDTO(
            query_log_id=result.query_log_id,
            user_query=result.user_query,
            generated_sql=result.generated_sql,
            status=result.status,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health_check():
    """API 헬스체크."""
    return {"status": "healthy"}

