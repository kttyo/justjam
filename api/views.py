from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET','POST'])
def favorite_item(request):
    if request.method == 'POST':
        print('POST requested')
        print(request.user)
        return Response()


@api_view(['GET','POST'])
def favorite_part(request):
    if request.method == 'POST':
        print('POST requested')
        print(request.user)
        return Response()