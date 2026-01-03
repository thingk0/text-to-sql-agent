from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from agent.domain.entities.query_log import QueryLog, QueryLogStatus
from agent.domain.repositories.query_log_repository import QueryLogRepository
from agent.infrastructure.database.models import QueryLogModel


class SQLAlchemyQueryLogRepository(QueryLogRepository):
    """QueryLogRepository의 SQLAlchemy 구현체."""

    def __init__(self, session: Session):
        self._session = session

    def save(self, query_log: QueryLog) -> QueryLog:
        model = QueryLogModel(
            id=str(query_log.id),
            user_query=query_log.user_query,
            generated_sql=query_log.generated_sql,
            status=query_log.status.value,
            error_message=query_log.error_message,
            created_at=query_log.created_at,
        )

        existing = self._session.query(QueryLogModel).filter_by(id=str(query_log.id)).first()
        if existing:
            existing.generated_sql = model.generated_sql
            existing.status = model.status
            existing.error_message = model.error_message
        else:
            self._session.add(model)

        self._session.commit()
        return query_log

    def find_by_id(self, id: UUID) -> Optional[QueryLog]:
        model = self._session.query(QueryLogModel).filter_by(id=str(id)).first()
        if not model:
            return None
        return self._model_to_entity(model)

    def find_all(self) -> list[QueryLog]:
        models = self._session.query(QueryLogModel).all()
        return [self._model_to_entity(m) for m in models]

    def delete(self, id: UUID) -> bool:
        model = self._session.query(QueryLogModel).filter_by(id=str(id)).first()
        if not model:
            return False
        self._session.delete(model)
        self._session.commit()
        return True

    def _model_to_entity(self, model: QueryLogModel) -> QueryLog:
        return QueryLog(
            id=UUID(model.id),
            user_query=model.user_query,
            generated_sql=model.generated_sql,
            status=QueryLogStatus(model.status),
            error_message=model.error_message,
            created_at=model.created_at,
        )

