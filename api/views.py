from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import FavoriteItemSerializer, FavoritePartSerializer
from .models import FavoriteItem, FavoritePart
import logging
logger = logging.getLogger(__name__)


@api_view(['GET', 'POST', 'DELETE'])
def favorite_item(request):
    logger.info(f'favorite_item: user={request.user.id}, method={request.method}')

    # GET: お気に入り一覧
    if request.user.id and request.method == 'GET':
        favorite_items = FavoriteItem.objects.filter(user=request.user.id)
        serializer = FavoriteItemSerializer(favorite_items, many=True)
        return Response(serializer.data)

    # POST: お気に入り追加
    elif request.user.id and request.method == 'POST':
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = FavoriteItemSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: お気に入り削除
    elif request.user.id and request.method == 'DELETE':
        media_type = request.query_params.get('media_type')
        media_id = request.query_params.get('media_id')

        if not media_type or not media_id:
            return Response({'error': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)

        items_to_delete = FavoriteItem.objects.filter(
            user=request.user.id,
            media_type=media_type,
            media_id=media_id
        )

        deleted_count, _ = items_to_delete.delete()
        logger.info(f"Deleted {deleted_count} FavoriteItem(s)")
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST', 'DELETE'])
def favorite_part(request):
    logger.info(f'favorite_part: user={request.user.id}, method={request.method}')

    # GET: ループ部分お気に入り一覧
    if request.user.id and request.method == 'GET':
        favorite_parts = FavoritePart.objects.filter(user=request.user.id)
        serializer = FavoritePartSerializer(favorite_parts, many=True)
        return Response(serializer.data)

    # POST: ループ部分追加
    elif request.user.id and request.method == 'POST':
        if request.user.role == 'free':
            current_count = FavoritePart.objects.filter(user=request.user).count()
        if current_count >= 5:
            return Response(
                {"detail": "無料ユーザーの保存上限（10件）を超えています。"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = FavoritePartSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: ループ部分削除
    elif request.user.id and request.method == 'DELETE':
        media_type = request.query_params.get('media_type')
        media_id = request.query_params.get('media_id')
        loop_start_time = request.query_params.get('loop_start_time')
        loop_end_time = request.query_params.get('loop_end_time')

        if not all([media_type, media_id, loop_start_time, loop_end_time]):
            return Response({'error': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)

        items_to_delete = FavoritePart.objects.filter(
            user=request.user.id,
            media_type=media_type,
            media_id=media_id,
            loop_start_time=loop_start_time,
            loop_end_time=loop_end_time
        )

        deleted_count, _ = items_to_delete.delete()
        logger.info(f"Deleted {deleted_count} FavoritePart(s)")
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
