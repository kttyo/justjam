from django.urls import path

from . import views

app_name = 'musickit'
urlpatterns = [
    path('', views.index, name="index"),
]
