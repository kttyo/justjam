from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import FavoriteItemSerializer


@api_view(['GET','POST'])
def favorite_item(request):
    if request.method == 'POST':
        print('POST requested')
        print(request.user)
        print(request.data)
        request.data['user'] = request.user.id # Passing user id, not user name
        print(request.data)
        serializer = FavoriteItemSerializer(data=request.data)
        print('serializer.is_valid(): '+ str(serializer.is_valid()))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET','POST'])
def favorite_part(request):
    if request.method == 'POST':
        print('POST requested')
        print(request.user)
        return Response()