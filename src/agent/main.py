from fastapi import FastAPI

from agent.config import settings

app = FastAPI(
    title="Text-to-SQL Agent",
    description="A text-to-SQL agent using LangChain and LangGraph",
    version="0.1.0",
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Text-to-SQL Agent",
        "env": settings.app_env,
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
