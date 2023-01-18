from django.urls import path

from . import views

app_name = 'account'
urlpatterns = [
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name="logout"),
    path('user-status', views.user_status, name="user-status"),
    path('signup', views.signup_view, name="signup"),
]
