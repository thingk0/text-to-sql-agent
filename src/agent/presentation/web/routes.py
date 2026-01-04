from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from agent.config import settings

router = APIRouter()

# 경로 설정
WEB_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = WEB_DIR / "templates"

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
async def home(request: Request):
    """메인 웹 UI 페이지."""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "title": "Text-to-SQL Agent",
            "env": settings.app_env,
        },
    )


@router.get("/tables/{table_name}", response_class=HTMLResponse, include_in_schema=False)
async def table_detail(request: Request, table_name: str):
    """테이블 상세 관리 페이지."""
    return templates.TemplateResponse(
        "table_detail.html",
        {
            "request": request,
            "title": f"Table: {table_name}",
            "table_name": table_name,
            "env": settings.app_env,
        },
    )
