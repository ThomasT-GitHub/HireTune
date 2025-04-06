from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("tuner/", views.tuner, name="tuner"),
    path("api/tune-resume/", views.tune_resume, name="tune_resume"),
    path("api/generate-pdf/", views.generate_pdf, name="generate_pdf"),
    path("api/test-pdf/", views.test_pdf, name="test_pdf"),
    path('api/current_user/', views.current_user, name='current_user'),
]
