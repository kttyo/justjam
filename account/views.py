from django.shortcuts import render, redirect
from .forms import LoginForm, CustomUserCreationForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.conf import settings


def user_status(request):
    dict_data = {}
    if request.user.is_authenticated:
        dict_data['authenticated'] = True
        dict_data['username'] = request.user.username
    else:
        dict_data['authenticated'] = False
        dict_data['username'] = 'AnonymousUser'
    return JsonResponse(dict_data, safe=False)


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()

            if user:
                login(request, user)
                if settings.DEBUG:
                    return redirect(to='http://localhost:8080/html?env=development')
                else:
                    return redirect(to='http://justjam.jppj.jp')

    else:
        context = {'form': LoginForm()}
        if settings.DEBUG:
            context['main_page'] = 'http://localhost:8080/html?env=development'
        else:
            context['main_page'] = 'http://justjam.jppj.jp'
        return render(request, 'registration/login.html', context)


def logout_view(request):
    logout(request)
    if settings.DEBUG:
        return redirect(to='http://localhost:8080/html?env=development')
    else:
        return redirect(to='http://justjam.jppj.jp')


def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            if settings.DEBUG:
                return redirect(to='http://localhost:8080/html?env=development')
            else:
                return redirect(to='http://justjam.jppj.jp')
        else:
            context = {
                'form': CustomUserCreationForm(),
                'error_message': 'Some Error Happened'
            }
            if settings.DEBUG:
                context['main_page'] = 'http://localhost:8080/html?env=development'
            else:
                context['main_page'] = 'http://justjam.jppj.jp'
            return render(request, 'registration/signup.html', context)

    else:
        context = {'form': CustomUserCreationForm()}
        return render(request, 'registration/signup.html', context)