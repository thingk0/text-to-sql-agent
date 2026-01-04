"""Embedding service for text vectorization."""

from sentence_transformers import SentenceTransformer
from typing import Optional


class EmbeddingService:
    """텍스트 임베딩 서비스 - sentence-transformers 기반."""

    _instance: "EmbeddingService | None" = None
    DEFAULT_MODEL = "all-MiniLM-L6-v2"

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_name: Optional[str] = None):
        if self._initialized:
            return

        self._initialized = True
        self._model = SentenceTransformer(model_name or self.DEFAULT_MODEL)

    def embed(self, text: str) -> list[float]:
        """단일 텍스트를 임베딩 벡터로 변환."""
        return self._model.encode(text).tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """여러 텍스트를 임베딩 벡터로 변환."""
        return self._model.encode(texts).tolist()


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
