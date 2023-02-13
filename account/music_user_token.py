import json
import datetime
import time
import jwt
import os
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

current_module_path = os.path.abspath(__file__)
static_path = os.path.join(os.path.dirname(current_module_path), 'auth_files')


def convert_date_to_epoch(date_string):
    time_tuple = time.strptime(date_string, "%Y%m%d")
    date_epoch = int(time.mktime(time_tuple))
    return date_epoch


def generate_jwt(current_date, future_date):
    with open(os.path.join(static_path, settings.AUTH_KEY_FILE), 'r') as authkey_file:
        key = authkey_file.read()
    iat = convert_date_to_epoch(current_date)
    exp = convert_date_to_epoch(future_date)
    encoded_jwt = jwt.encode(
        {"iss": settings.TEAM_ID, "iat": iat, "exp": exp},
        key,
        algorithm="ES256",
        headers={"kid": settings.KEY_ID}
    )
    return encoded_jwt


def update_jwt_json(jwt, current_date, future_date):
    with open(os.path.join(static_path, settings.JWT_JSON_FILE), 'w', encoding='utf-8') as jwt_json:
        data = {
            'iat': current_date,
            'exp': future_date,
            'jwt': jwt
        }
        json_string = json.dumps(data, indent=4)
        jwt_json.write(json_string)


def get_music_user_token():
    current_date = datetime.datetime.now()
    future_date = current_date + datetime.timedelta(days=7)

    try:
        with open(os.path.join(static_path, settings.JWT_JSON_FILE), 'r', encoding='utf-8') as json_file:
            current_jwt = json.load(json_file)

        if current_date.strftime("%Y%m%d") < current_jwt['exp']:
            return current_jwt

        else:
            new_jwt = generate_jwt(
                current_date=current_date.strftime("%Y%m%d"),
                future_date=future_date.strftime("%Y%m%d")
            )
            update_jwt_json(
                jwt=new_jwt,
                current_date=current_date.strftime("%Y%m%d"),
                future_date=future_date.strftime("%Y%m%d")
            )
            with open(os.path.join(static_path, settings.JWT_JSON_FILE), 'r', encoding='utf-8') as json_file:
                current_jwt = json.load(json_file)
            return current_jwt

    except Exception as e:
        logger.error(e)