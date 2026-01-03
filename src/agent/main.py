from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from agent.config import settings

# 디렉토리 경로 설정
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

# 디렉토리 생성
STATIC_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="Text-to-SQL Agent",
    description="A text-to-SQL agent using LangChain and LangGraph",
    version="0.1.0",
)

# 정적 파일 및 템플릿 설정
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page with web UI."""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "title": "Text-to-SQL Agent",
            "env": settings.app_env,
        },
    )


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
