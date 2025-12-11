from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import SocialAccount

User = get_user_model()


class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "name", "is_staff", "is_active"]

    # 詳細画面で表示する内容
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Important dates", {"fields": ("last_login",)}),
    )

    # 管理画面からユーザー作成するときの入力フォーム
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "password1", "password2", "is_staff", "is_superuser"),
        }),
    )

    search_fields = ("email", "name")


# User モデルと SocialAccount を管理画面に登録
admin.site.register(User, UserAdmin)
admin.site.register(SocialAccount)
