from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import FavoriteItemSerializer, FavoritePartSerializer
from .models import FavoriteItem, FavoritePart
import logging
logger = logging.getLogger(__name__)


@api_view(['GET','POST','DELETE'])
def favorite_item(request):
    logger.info('favorite_item function: {}'.format(request.user.id))
    logger.info('favorite_item function: {}'.format(request.method))
    logger.info('favorite_item function: {}'.format(request.data))
    if request.user.id and request.method == 'GET':
        favorite_items = FavoriteItem.objects.filter(user=request.user.id)
        serializer = FavoriteItemSerializer(favorite_items, many=True)
        return Response(serializer.data)

    elif request.user.id and request.method == 'POST':
        request.data['user'] = request.user.id # Passing user id, not user name
        serializer = FavoriteItemSerializer(data=request.data)
        print('serializer.is_valid(): ' + str(serializer.is_valid()))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.user.id and request.method == 'DELETE':
        items_to_delete = FavoriteItem.objects.filter(
            user=request.user.id
        ).filter(
            media_type=request.data['media_type']
        ).filter(
            media_id=request.data['media_id']
        )
        items_to_delete.delete()
        print(items_to_delete)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET','POST','DELETE'])
def favorite_part(request):
    logger.info('favorite_part function: {}'.format(request.user.id))
    logger.info('favorite_part function: {}'.format(request.method))
    if request.user.id and request.method == 'GET':
        logger.info(request.method)
        favorite_parts = FavoritePart.objects.filter(user=request.user.id)
        serializer = FavoritePartSerializer(favorite_parts, many=True)
        return Response(serializer.data)

    elif request.user.id and request.method == 'POST':
        logger.info(request.data)
        request.data['user'] = request.user.id  # Passing user id, not user name
        serializer = FavoritePartSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.user.id and request.method == 'DELETE':
        # print(request.data)
        items_to_delete = FavoritePart.objects.filter(
            user=request.user.id
        ).filter(
            media_type=request.data['media_type']
        ).filter(
            loop_start_time=request.data['loop_start_time']
        ).filter(
            loop_end_time=request.data['loop_end_time']
        )
        print(items_to_delete)
        items_to_delete.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)