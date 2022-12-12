from django.shortcuts import render
from django.conf import settings


def index(request):
    context = {
        'user': request.user,
        'user_is_authenticated': request.user.is_authenticated,
        'musickit_dev_token': settings.MUSICKIT_DEVELOPER_TOKEN,
    }

    if request.user.is_authenticated:
        context['username'] = request.user.username

    print(context)
    return render(request, 'musickit.html', context)
