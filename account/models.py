# account/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):

    def create_user(self, email, name=None, password=None):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, name=name)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, name=None, password=None):
        user = self.create_user(email, name, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    avatar = models.URLField(null=True, blank=True)

    ROLE_CHOICES = (
        ('free', 'Free'),
        ('premium', 'Premium'),
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='free'
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self):
        return self.email


class SocialAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="social_accounts")
    provider = models.CharField(max_length=50)
    sub = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            ("provider", "sub"),
            ("provider", "email"),
        )
