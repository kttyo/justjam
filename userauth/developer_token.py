import json
import time
import jwt
import os
import logging
from django.conf import settings
from typing import Optional

logger = logging.getLogger(__name__)

current_module_path = os.path.abspath(__file__)
static_path = os.path.join(os.path.dirname(current_module_path), 'auth_files')

# ==============================
# 設定値
# ==============================
TOKEN_LIFETIME_SECONDS = 60 * 60 * 12   # 12時間
REFRESH_MARGIN_SECONDS = 60 * 10        # exp - 10分で更新


def _load_cached_token() -> Optional[dict]:
    try:
        with open(os.path.join(static_path, settings.JWT_JSON_FILE), 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except Exception as e:
        logger.error(f"Failed to load developer token: {e}")
        return None


def _save_token(data: dict):
    with open(os.path.join(static_path, settings.JWT_JSON_FILE), 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)


def _generate_new_token(now: int) -> dict:
    with open(os.path.join(static_path, settings.AUTH_KEY_FILE), 'r') as authkey_file:
        private_key = authkey_file.read()

    payload = {
        "iss": settings.TEAM_ID,
        "iat": now,
        "exp": now + TOKEN_LIFETIME_SECONDS,
    }

    token = jwt.encode(
        payload,
        private_key,
        algorithm="ES256",
        headers={"kid": settings.KEY_ID}
    )

    return {
        "jwt": token,
        "iat": payload["iat"],
        "exp": payload["exp"],
    }


def get_developer_token() -> dict:
    """
    Apple Music Developer Token を取得
    - 有効期限が十分残っていれば再利用
    - exp - 10分を切ったら自動更新
    """
    now = int(time.time())
    cached = _load_cached_token()

    if cached:
        exp = cached.get("exp", 0)

        # exp - 10分 以上残っていれば再利用
        if exp > now + REFRESH_MARGIN_SECONDS:
            return cached

        logger.info("Developer Token is expiring soon. Refreshing...")

    # 新規発行
    new_token = _generate_new_token(now)
    _save_token(new_token)

    logger.info("New Developer Token generated.")

    return new_token
