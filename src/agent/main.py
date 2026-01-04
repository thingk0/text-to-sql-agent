from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from agent.infrastructure.database.connection import init_db, shutdown_db
from agent.presentation.api.routes import database_routes, query_routes
from agent.presentation.web.routes import router as web_router

# 정적 파일 경로
WEB_DIR = Path(__file__).resolve().parent / "presentation" / "web"
STATIC_DIR = WEB_DIR / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    init_db()
    
    # Index schemas for RAG on startup
    try:
        from agent.infrastructure.database.connection import get_engine
        from agent.infrastructure.database.schema_service import SchemaService
        from agent.application.services.schema_indexer import get_schema_indexer
        
        schema_service = SchemaService(db_engine=get_engine())
        indexer = get_schema_indexer(schema_service)
        indexed_count = indexer.index_all_tables()
        print(f"[RAG] Indexed {indexed_count} tables for schema retrieval")
    except Exception as e:
        print(f"[RAG] Schema indexing failed: {e}")
    
    yield
    shutdown_db()


app = FastAPI(
    title="Text-to-SQL Agent",
    description="A text-to-SQL agent using LangChain and LangGraph",
    version="0.1.0",
    lifespan=lifespan,
)

# 정적 파일 마운트
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# 라우터 등록
app.include_router(web_router)
app.include_router(query_routes.router)
app.include_router(database_routes.router)
