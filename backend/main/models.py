from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


# --------------------
# User Model
# --------------------
class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


# --------------------
# Sensor Model
# --------------------
class Sensor(models.Model):
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sensors")
    name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.model})"


# --------------------
# Reading Model
# --------------------
class Reading(models.Model):
    sensor = models.ForeignKey(
        Sensor, on_delete=models.CASCADE, related_name="readings")
    temperature = models.FloatField()
    humidity = models.FloatField()
    timestamp = models.DateTimeField()

    class Meta:
        unique_together = ("sensor", "timestamp")
        indexes = [
            models.Index(fields=["sensor", "timestamp"]),
        ]
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Reading for {self.sensor.name} @ {self.timestamp}"
