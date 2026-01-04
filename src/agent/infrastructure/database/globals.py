"""Global schema service and indexer instances for dependency injection."""

from typing import Optional

from agent.infrastructure.database.connection import get_engine
from agent.infrastructure.database.schema_service import SchemaService
from agent.application.services.schema_indexer import SchemaIndexer
from agent.infrastructure.vectorstore.chroma_client import get_chroma_client


_schema_service: Optional[SchemaService] = None
_schema_indexer: Optional[SchemaIndexer] = None


def init_schema_services() -> int:
    """Initialize schema service and indexer with proper wiring.
    
    Returns:
        Number of indexed tables
    """
    global _schema_service, _schema_indexer
    
    engine = get_engine()
    _schema_service = SchemaService(db_engine=engine)
    
    chroma = get_chroma_client()
    _schema_indexer = SchemaIndexer(
        schema_service=_schema_service,
        chroma_client=chroma
    )
    
    # Wire indexer back to schema service for auto-indexing
    _schema_service.set_indexer(_schema_indexer)
    
    # Index all existing tables
    return _schema_indexer.index_all_tables()


def get_global_schema_service() -> SchemaService:
    """Get the global schema service instance."""
    if _schema_service is None:
        init_schema_services()
    return _schema_service


def get_global_schema_indexer() -> SchemaIndexer:
    """Get the global schema indexer instance."""
    if _schema_indexer is None:
        init_schema_services()
    return _schema_indexer
