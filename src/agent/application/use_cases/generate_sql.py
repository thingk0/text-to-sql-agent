from dataclasses import dataclass

from agent.domain.entities.query_log import QueryLog
from agent.domain.repositories.query_log_repository import QueryLogRepository
from agent.domain.services.sql_generator import SQLGenerator


@dataclass
class GenerateSQLRequest:
    """SQL 생성 요청 DTO."""

    user_query: str
    schema_context: str = ""


@dataclass
class GenerateSQLResponse:
    """SQL 생성 응답 DTO."""

    query_log_id: str
    user_query: str
    generated_sql: str
    status: str


class GenerateSQLUseCase:
    """자연어를 SQL로 변환하는 유스케이스."""

    def __init__(
        self,
        query_log_repository: QueryLogRepository,
        sql_generator: SQLGenerator,
    ):
        self._query_log_repository = query_log_repository
        self._sql_generator = sql_generator

    def execute(self, request: GenerateSQLRequest) -> GenerateSQLResponse:
        """유스케이스 실행."""
        # 1. QueryLog 엔티티 생성
        query_log = QueryLog(user_query=request.user_query)
        query_log.mark_processing()

        try:
            # 2. SQL 생성
            generated_sql = self._sql_generator.generate(
                user_query=request.user_query,
                schema_context=request.schema_context,
            )
            query_log.complete(generated_sql)

        except Exception as e:
            query_log.fail(str(e))
            raise

        # 3. 저장
        saved_log = self._query_log_repository.save(query_log)

        # 4. 응답 반환
        return GenerateSQLResponse(
            query_log_id=str(saved_log.id),
            user_query=saved_log.user_query,
            generated_sql=saved_log.generated_sql or "",
            status=saved_log.status.value,
        )

