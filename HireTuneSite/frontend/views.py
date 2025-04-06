from django.shortcuts import render
from django.http import HttpResponse
from django.views import View


def index(request):
    return render(request, "frontend/index.html")


def tuner(request):
    return render(request, "frontend/tuner.html")

class TestView(View):
    def get(self, request):
        return HttpResponse("Discord OAuth worked! You're logged in.")