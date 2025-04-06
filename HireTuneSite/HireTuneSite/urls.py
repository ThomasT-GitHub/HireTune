from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("tuner/auth/", include("social_django.urls", namespace="social")), # discord urls
    path("", include("frontend.urls")),  # Include frontend URLs
]
