# Text-to-SQL Agent

LangChain과 LangGraph를 사용한 FastAPI 기반 Text-to-SQL 에이전트입니다.

## 기술 스택

- **FastAPI**: API 구축을 위한 현대적인 웹 프레임워크
- **SQLAlchemy**: SQL 툴킷 및 ORM
- **pglite**: 경량 PostgreSQL
- **LangChain**: LLM 애플리케이션 개발 프레임워크
- **LangGraph**: LLM을 사용한 상태 기반 멀티 액터 애플리케이션 구축 라이브러리

## 설치

1. Poetry 설치 (설치되어 있지 않은 경우):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. 의존성 설치:
```bash
poetry install
```

3. 개발 의존성 포함 설치:
```bash
poetry install --with dev
```

4. `.env.example`을 기반으로 `.env` 파일 생성:
```bash
cp .env.example .env
```

5. `.env` 파일을 본인의 설정에 맞게 수정하세요.

## 애플리케이션 실행

개발 서버 시작:
```bash
poetry run uvicorn agent.main:app --reload
```

API는 `http://localhost:8000`에서 사용할 수 있습니다.

- API 문서: `http://localhost:8000/docs`
- 대체 문서: `http://localhost:8000/redoc`

## 프로젝트 구조

```
text-to-sql-agent/
├── src/
│   └── agent/
│       ├── __init__.py
│       ├── main.py          # FastAPI 애플리케이션
│       ├── config.py         # 설정
│       └── database.py       # 데이터베이스 설정
├── tests/
├── .env.example
├── .gitignore
├── pyproject.toml
└── README.md
```

## 개발

테스트 실행:
```bash
poetry run pytest
```

코드 포맷팅:
```bash
poetry run ruff format .
```

코드 린트:
```bash
poetry run ruff check .
```
