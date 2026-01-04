from dataclasses import dataclass
from typing import Optional

from agent.domain.entities.query_log import QueryLog
from agent.domain.repositories.query_log_repository import QueryLogRepository
from agent.domain.services.sql_generator import SQLGenerator
from agent.domain.services.schema_retriever import SchemaRetriever


@dataclass
class GenerateSQLRequest:
    """SQL 생성 요청 DTO."""

    user_query: str
    schema_context: str = ""
    use_rag: bool = True  # RAG 사용 여부


@dataclass
class GenerateSQLResponse:
    """SQL 생성 응답 DTO."""

    query_log_id: str
    user_query: str
    generated_sql: str
    status: str
    used_tables: list[str] | None = None  # RAG로 검색된 테이블 목록


class GenerateSQLUseCase:
    """자연어를 SQL로 변환하는 유스케이스."""

    def __init__(
        self,
        query_log_repository: QueryLogRepository,
        sql_generator: SQLGenerator,
        schema_retriever: Optional[SchemaRetriever] = None,
    ):
        self._query_log_repository = query_log_repository
        self._sql_generator = sql_generator
        self._schema_retriever = schema_retriever

    def execute(self, request: GenerateSQLRequest) -> GenerateSQLResponse:
        """유스케이스 실행."""
        # 1. QueryLog 엔티티 생성
        query_log = QueryLog(user_query=request.user_query)
        query_log.mark_processing()

        used_tables = None

        try:
            # 2. 스키마 컨텍스트 결정
            schema_context = request.schema_context
            
            # RAG 사용 시 검색된 스키마로 컨텍스트 구성
            if request.use_rag and self._schema_retriever and not schema_context:
                schemas = self._schema_retriever.retrieve(
                    query=request.user_query,
                    top_k=5
                )
                if schemas:
                    used_tables = [s.table_name for s in schemas]
                    schema_context = self._schema_retriever.build_context(
                        query=request.user_query,
                        top_k=5
                    )

            # 3. SQL 생성
            generated_sql = self._sql_generator.generate(
                user_query=request.user_query,
                schema_context=schema_context,
            )
            query_log.complete(generated_sql)

        except Exception as e:
            query_log.fail(str(e))
            raise

        # 4. 저장
        saved_log = self._query_log_repository.save(query_log)

        # 5. 응답 반환
        return GenerateSQLResponse(
            query_log_id=str(saved_log.id),
            user_query=saved_log.user_query,
            generated_sql=saved_log.generated_sql or "",
            status=saved_log.status.value,
            used_tables=used_tables,
        )

