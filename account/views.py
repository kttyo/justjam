from django.shortcuts import render, redirect
from .forms import LoginForm
from django.contrib.auth import login, logout


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()

            if user:
                login(request, user)
                return redirect(to='musickit:index')

    else:
        form = LoginForm()

    context = {
        'form': form,
    }

    return render(request, 'registration/login.html', context)


def logout_view(request):
    logout(request)

    return redirect(to='musickit:index')
