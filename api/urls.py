from django.urls import path

from . import views

app_name = 'api'
urlpatterns = [
    path('favorite/item/', views.favorite_item, name="favorite-item"),
    path('favorite/part/', views.favorite_part, name="favorite-part"),
]
