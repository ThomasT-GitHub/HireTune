from django.shortcuts import render
from django.http import HttpResponse
from django.views import View
from django.http import JsonResponse


def current_user(request):
    data = {
        'is_authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None,
    }
    return JsonResponse(data)


def index(request):
    return render(request, "frontend/index.html")


def tuner(request):
    return render(request, "frontend/tuner.html")
