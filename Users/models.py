from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    embedding = models.JSONField(null=True, blank=True)
    reconocimiento_facial = models.BooleanField(default=False)
    reconocimiento_voz = models.BooleanField(default=False)

    def __str__(self):
        return self.username