from django.urls import path
from . import views
from .views import current_user

urlpatterns = [
    path("", views.index, name="index"),
    path("tuner/", views.tuner, name="tuner"),
    path('api/current_user/', current_user, name='current-user'),

]
