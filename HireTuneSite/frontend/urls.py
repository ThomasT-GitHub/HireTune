from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("tuner/", views.tuner, name="tuner"),
    path("applications/", views.applicationView, name="applicationView"),
    path("api/tune-resume/", views.tune_resume, name="tune_resume"),
    path("api/generate-pdf/", views.generate_pdf, name="generate_pdf"),
    path("api/test-pdf/", views.test_pdf, name="test_pdf"),
    path("api/user-info/", views.get_user_info, name="user_info"),
    path("api/applications/", views.list_applications, name="list_applications"),
    path(
        "api/applications/<int:app_id>/",
        views.application_detail,
        name="application_detail",
    ),
    path("api/save-application/", views.save_application, name="save_application"),
    path("api/current_user/", views.current_user, name="current_user"),
    path("api/logout/", views.logout_view, name="logout"),
]
