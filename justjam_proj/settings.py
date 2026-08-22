from .settings_common import *

ALLOWED_HOSTS = ['justjam.jppj.jp', 'loopa.jppj.jp', 'loopamusic.com']

STATIC_ROOT = '/srv/loopa/backend/static/'

CSRF_TRUSTED_ORIGINS = ['https://justjam.jppj.jp','https://loopa.jppj.jp','https://loopamusic.com']

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    'https://loopa.jppj.jp','https://loopamusic.com'
]