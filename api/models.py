from django.conf import settings
from django.db import models

# Create your models here.
class FavoritePart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=12)
    media_id = models.CharField(max_length=30)
    loop_start_time = models.IntegerField()
    loop_end_time = models.IntegerField()


class FavoriteItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=8)
    media_id = models.CharField(max_length=30)