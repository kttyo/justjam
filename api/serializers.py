from rest_framework import serializers
from .models import FavoritePart, FavoriteItem


class FavoritePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoritePart
        fields = '__all__'


class FavoriteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteItem
        fields = '__all__'