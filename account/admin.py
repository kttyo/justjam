from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Referencing the custom User from .models, not the default User
admin.site.register(User, UserAdmin)