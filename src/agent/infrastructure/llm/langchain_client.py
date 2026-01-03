from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from agent.config import settings
from agent.domain.services.sql_generator import SQLGenerator


class LangChainSQLGenerator(SQLGenerator):
    """SQLGenerator의 LangChain 구현체 (Novita.ai API 사용)."""

    _instance: "LangChainSQLGenerator | None" = None

    def __new__(cls) -> "LangChainSQLGenerator":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._initialized = True
        self._llm = ChatOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            model=settings.openai_model,
            temperature=0,
        )

        self._prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert SQL query generator.
Given a natural language question and database schema context, generate a valid SQL query.
Only output the SQL query, no explanations.

Database Schema:
{schema_context}
"""),
            ("human", "{user_query}"),
        ])

        self._chain = self._prompt | self._llm

    def generate(self, user_query: str, schema_context: str) -> str:
        """자연어를 SQL로 변환합니다."""
        if not schema_context:
            schema_context = "No schema provided. Generate a generic SQL query."

        response = self._chain.invoke({
            "user_query": user_query,
            "schema_context": schema_context,
        })

        return response.content


def get_sql_generator() -> LangChainSQLGenerator:
    return LangChainSQLGenerator()
