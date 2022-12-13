from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import FavoriteItemSerializer
from .models import FavoriteItem


@api_view(['GET','POST','DELETE'])
def favorite_item(request):
    if request.user.id and request.method == 'GET':
        favorite_items = FavoriteItem.objects.all()
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
        print(request.data)
        items_to_delete = FavoriteItem.objects.filter(
            user=request.user.id
        ).filter(
            media_type=request.data['media_type']
        ).filter(media_id=request.data['media_id'])
        print(items_to_delete.delete())
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET','POST'])
def favorite_part(request):
    if request.method == 'POST':
        print('POST requested')
        print(request.user)
        return Response()