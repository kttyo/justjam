from .settings_common import *

ALLOWED_HOSTS = ['justjam.jppj.jp', 'loopa.jppj.jp', 'loopamusic.com']

STATIC_ROOT = '/var/www/jppj.jp/justjam/html/static/'

CSRF_TRUSTED_ORIGINS = ['https://justjam.jppj.jp','https://loopa.jppj.jp','loopamusic.com']

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = ['https://justjam.jppj.jp','https://loopa.jppj.jp','loopamusic.com']

CORS_ALLOWED_ORIGINS = [
    'https://loopa.jppj.jp','loopamusic.com'
]