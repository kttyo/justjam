from django.shortcuts import render, redirect
from .forms import LoginForm, CustomUserCreationForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.conf import settings
from .music_user_token import get_music_user_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging
logger = logging.getLogger(__name__)

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def proxy_login(request):
    """
    NextAuthからemailを受け取り、
    対応するユーザーを作成 or 取得してJWTを発行
    """
    email = request.data.get('email')
    name = request.data.get('name', '')

    if not email:
        return Response({"error": "email required"}, status=400)

    user, _ = User.objects.get_or_create(email=email, defaults={"username": name})

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
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


def music_user_token(request):
    dict_data = get_music_user_token()
    return JsonResponse(dict_data, safe=False)


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