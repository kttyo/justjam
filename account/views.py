from django.shortcuts import render, redirect
from .forms import LoginForm, CustomUserCreationForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout
from django.http import JsonResponse


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
                return redirect(to='http://localhost:8080')

    else:
        context = {'form': LoginForm()}
        return render(request, 'registration/login.html', context)


def logout_view(request):
    logout(request)

    return redirect(to='http://localhost:8080')


def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(to='http://localhost:8080')
        else:
            context = {
                'form': CustomUserCreationForm(),
                'error_message': 'Some Error Happened'
            }
            return render(request, 'registration/signup.html', context)

    else:
        context = {'form': CustomUserCreationForm()}
        return render(request, 'registration/signup.html', context)