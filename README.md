# Text-to-SQL Agent

LangChain과 ChromaDB RAG를 활용한 FastAPI 기반 지능형 Text-to-SQL 에이전트입니다.

## 주요 기능

- 🤖 **자연어 → SQL 변환**: LLM 기반 SQL 쿼리 자동 생성
- 🔍 **RAG 기반 스키마 검색**: ChromaDB를 활용한 지능형 테이블 매칭
- 📊 **테이블 관리**: 웹 UI를 통한 테이블 생성/수정/삭제
- 👁️ **DDL 실시간 프리뷰**: 테이블 생성 시 SQL 미리보기
- 🔄 **자동 인덱싱**: 스키마 변경 시 벡터 DB 자동 갱신
- 🎨 **직관적 웹 UI**: Tailwind CSS 기반 모던 인터페이스

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **Database** | SQLite (로컬), PostgreSQL (프로덕션 지원) |
| **LLM** | LangChain, OpenAI API (Novita.ai 호환) |
| **RAG** | ChromaDB, sentence-transformers |
| **Frontend** | Jinja2, Tailwind CSS, Lucide Icons |

## 아키텍처

```
사용자 쿼리 → ChromaDB 검색 → 관련 테이블 추출 → LLM → SQL 생성
                    ↑
            자동 인덱싱 (스키마 변경 시)
```

## 설치 및 실행

### 1. 의존성 설치

```bash
# Poetry 설치 (없는 경우)
curl -sSL https://install.python-poetry.org | python3 -

# 프로젝트 의존성 설치
poetry install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일 수정:
```env
# OpenAI API (Novita.ai 등)
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.novita.ai/v3/openai
OPENAI_MODEL=meta-llama/llama-3.1-70b-instruct

# Database
DATABASE_URL=sqlite:///./sql_agent.db

# ChromaDB
CHROMA_PERSIST_DIR=./chroma_db
```

### 3. 서버 실행

```bash
poetry run uvicorn agent.main:app --reload
```

웹 UI: http://localhost:8000  
API 문서: http://localhost:8000/docs

## 프로젝트 구조 (DDD)

```
src/agent/
├── main.py                         # FastAPI 엔트리포인트
├── config.py                       # 환경 설정
│
├── domain/                         # 도메인 레이어
│   ├── entities/                   # 엔티티 (QueryLog)
│   ├── repositories/               # 리포지토리 인터페이스
│   └── services/                   # 도메인 서비스 (SQLGenerator, SchemaRetriever)
│
├── application/                    # 애플리케이션 레이어
│   ├── use_cases/                  # 유스케이스 (GenerateSQL)
│   └── services/                   # 앱 서비스 (SchemaIndexer)
│
├── infrastructure/                 # 인프라 레이어
│   ├── database/                   # DB 연결, SchemaService
│   ├── repositories/               # 리포지토리 구현체
│   ├── llm/                        # LangChain 클라이언트
│   └── vectorstore/                # ChromaDB 클라이언트
│
└── presentation/                   # 프레젠테이션 레이어
    ├── api/routes/                 # REST API 엔드포인트
    └── web/                        # 웹 UI (templates, static)
```

## 개발

### 테스트
```bash
poetry run pytest
```

### 코드 품질
```bash
# 포맷팅
poetry run ruff format .

# 린트
poetry run ruff check .
```

## 주요 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/query/generate` | 자연어 → SQL 변환 |
| GET | `/api/database/tables` | 테이블 목록 조회 |
| POST | `/api/database/tables` | 테이블 생성 |
| GET | `/api/database/schema-context` | 전체 스키마 컨텍스트 |

## RAG 동작 방식

1. **스키마 인덱싱** (서버 시작 시)
   - 모든 테이블 메타데이터를 ChromaDB에 임베딩 저장
   
2. **쿼리 처리**
   - 사용자 질문 → 임베딩 변환
   - ChromaDB에서 유사 테이블 검색 (Top-K)
   - 검색된 스키마만 LLM에 전달
   
3. **자동 갱신**
   - 테이블 생성/삭제/수정 시 인덱스 자동 업데이트

## 라이선스

MIT
