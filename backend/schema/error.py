from ninja import Schema

class ErrorResponse(Schema):
    code: int
    message: str
