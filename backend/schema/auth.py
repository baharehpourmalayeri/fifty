from ninja import Schema, Field
from ninja.security import HttpBearer
from django.http import HttpRequest

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken, Token
from rest_framework_simplejwt.exceptions import TokenError
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()


class TokenAuth(HttpBearer):
    def authenticate(self, request: HttpRequest, token: str):
        try:
            if token.startswith("Bearer "):
                token = token[7:]

            access_token = AccessToken(token)
        except TokenError as e:
            return None

        # Get user_id from token payload
        user_id = access_token.get("user_id")
        if not user_id:
            return None

        try:
            user = User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return None

        # Attach user to request
        request.user = user
        return user


class UserSummary(Schema):
    id: int = Field(..., example=1)
    email: str = Field(..., example="alice@example.com")
    username: str = Field(..., example="alice")


class RegisterRequest(Schema):
    email: str = Field(..., example="alice@example.com")
    username: str = Field(..., example="alice")
    password: str = Field(..., example="abcd@123")


class RegisterResponse(Schema):
    access_token: str
    refresh_token: str
    user: UserSummary


class LoginRequest(Schema):
    email: str = Field(..., example="alice@example.com")
    password: str = Field(..., example="abcd@123")


class LoginResponse(Schema):
    access_token: str
    refresh_token: str
    user: UserSummary
