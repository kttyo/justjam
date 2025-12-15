from django.shortcuts import render, redirect
from .forms import LoginForm, CustomUserCreationForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.conf import settings
from .developer_token import get_developer_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
import logging
import time
from .models import SocialAccount   # ← これが今回必要
logger = logging.getLogger(__name__)

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def proxy_login(request):
    """
    NextAuth から送られる Google / Email / Apple ログインを統合処理する API。
    User + SocialAccount を自動生成し、JWT を返す。
    """
    provider = request.data.get("provider")
    email = request.data.get("email")
    name = request.data.get("name", "")
    id_token_value = request.data.get("id_token")  # Google / Apple 用

    logger.info(f"[proxy_login] provider={provider}, email={email}, has_id_token={bool(id_token_value)}")

    if not provider:
        return Response({"error": "provider is required"}, status=400)

    # ----------------------------------------------------
    # ① Google ログイン
    # ----------------------------------------------------
    sub = None
    if provider == "google":
        if not id_token_value:
            return Response({"error": "id_token is required for Google login"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_value,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=5  # just for testing phase
            )
            email = idinfo.get("email")
            name = idinfo.get("name", name)
            sub = idinfo.get("sub")       # ← Google 固有ID

        except Exception as e:
            return Response({"error": f"Google token verification failed: {str(e)}"}, status=400)

    # ----------------------------------------------------
    # ② Magic Link（Email Provider）
    # ----------------------------------------------------
    elif provider == "email":
        if not email:
            return Response({"error": "email is required for email login"}, status=400)

    # ----------------------------------------------------
    # ③ Apple（後日）
    # ----------------------------------------------------
    elif provider == "apple":
        # TODO: Apple の id_token 検証
        pass

    else:
        return Response({"error": "Unsupported provider"}, status=400)

    # ----------------------------------------------------
    # ④ User を作成 or 取得（email 基準）
    # ----------------------------------------------------
    user, created = User.objects.get_or_create(
        email=email,
        defaults={"name": name}
    )

    # ----------------------------------------------------
    # ⑤ SocialAccount 紐付け（Google, Apple は sub で紐づけ）
    # ----------------------------------------------------
    if provider in ["google", "apple"]:
        if not sub:
            return Response({"error": "sub is required for Google/Apple login"}, status=400)

        SocialAccount.objects.get_or_create(
            user=user,
            provider=provider,
            sub=sub
        )

    # Magic Link の場合（email で紐づけ）
    elif provider == "email":
        SocialAccount.objects.get_or_create(
            user=user,
            provider="email",
            email=email
        )

    # ----------------------------------------------------
    # ⑥ JWT 発行
    # ----------------------------------------------------
    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })

main_page_url = 'http://justjam.jppj.jp'
if settings.DEBUG:
    # main_page_url = 'http://localhost:8080/html?env=development'
    main_page_url = 'http://localhost:3000'

def user_status(request):
    dict_data = {}
    if request.user.is_authenticated:
        dict_data['authenticated'] = True
        dict_data['username'] = request.user.username
    else:
        dict_data['authenticated'] = False
        dict_data['username'] = 'AnonymousUser'
    logger.info(dict_data)
    return JsonResponse(dict_data, safe=False)


@api_view(["GET"])
@permission_classes([AllowAny])
def developer_token(request):
    try:
        dict_data = get_developer_token()
        return Response(dict_data)
    except Exception as e:
        logger.exception("music_user_token failed")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            logger.info('Form input was valid')
            user = form.get_user()

            if user:
                login(request, user)
                return redirect(to=main_page_url)
            else:
                logger.error('error happened')
                context = {
                    'form': LoginForm(),
                    'main_page': main_page_url
                }
                return render(request, 'registration/login.html', context)
        else:
            logger.info('Form input was not valid')
            context = {
                'form': LoginForm(),
                'main_page': main_page_url,
                'error_message': 'Your input was not valid. Please try again.'
            }
            return render(request, 'registration/login.html', context)

    else:
        context = {
            'form': LoginForm(),
            'main_page': main_page_url
        }
        return render(request, 'registration/login.html', context)


def logout_view(request):
    logout(request)
    return redirect(to=main_page_url)


def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(to=main_page_url)
        else:
            context = {
                'form': CustomUserCreationForm(),
                'error_message': 'Some Error Happened',
                'main_page': main_page_url
            }
            return render(request, 'registration/signup.html', context)

    else:
        context = {
            'form': CustomUserCreationForm(),
            'main_page': main_page_url
        }
        return render(request, 'registration/signup.html', context)