import os
from pathlib import Path
from .settings_common import *


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost','127.0.0.1']

DATABASES['default']['NAME'] = 'justjam_dev'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = ['http://localhost:8080','http://localhost:3000']

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = ['http://localhost:8080','http://localhost:3000']

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")