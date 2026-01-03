class DomainException(Exception):
    """도메인 레이어 기본 예외."""

    pass


class EntityNotFoundException(DomainException):
    """엔티티를 찾을 수 없을 때 발생하는 예외."""

    def __init__(self, entity_type: str, entity_id: str):
        self.entity_type = entity_type
        self.entity_id = entity_id
        super().__init__(f"{entity_type} with id '{entity_id}' not found")


class SQLGenerationException(DomainException):
    """SQL 생성 실패 시 발생하는 예외."""

    def __init__(self, message: str, original_error: Exception | None = None):
        self.original_error = original_error
        super().__init__(message)
