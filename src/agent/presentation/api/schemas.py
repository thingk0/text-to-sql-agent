from pydantic import BaseModel


class GenerateSQLRequestDTO(BaseModel):
    user_query: str
    schema_context: str = ""


class GenerateSQLResponseDTO(BaseModel):
    query_log_id: str
    user_query: str
    generated_sql: str
    status: str
