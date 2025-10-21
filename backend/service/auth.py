from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.db import IntegrityError

User = get_user_model()


def register_user(email: str, username: str, password: str):
    if User.objects.filter(email=email).exists():
        raise ValueError("Email already registered")

    if User.objects.filter(username=username).exists():
        raise ValueError("Username already taken")

    try:
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password
        )
    except IntegrityError:
        raise ValueError("Could not create user")

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    return user, access_token, refresh_token


def authenticate_user(email: str, password: str):
    user = authenticate(username=email, password=password)

    if user is None:
        raise ValueError("Invalid email or password")

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    return user, access_token, refresh_token


def refresh_user_token(token: str):
    try:
        referesh_token = RefreshToken(token)
    except TokenError:
        raise ValueError("Invalid or expired refresh token")

    # Get user
    user_id = referesh_token["user_id"]
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValueError("User not found")

    # Create new refresh token (rotated)
    new_refresh = RefreshToken.for_user(user)
    return user, str(new_refresh.access_token), str(new_refresh)
