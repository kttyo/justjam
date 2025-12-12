from .settings_common import *

ALLOWED_HOSTS = ['justjam.jppj.jp', 'loopa.jppj.jp']

STATIC_ROOT = '/var/www/jppj.jp/justjam/html/static/'

CSRF_TRUSTED_ORIGINS = ['https://justjam.jppj.jp','https://loopa.jppj.jp']

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = ['https://justjam.jppj.jp','https://loopa.jppj.jp']