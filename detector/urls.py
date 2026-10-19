from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/detect/", views.detect_api, name="detect_api"),
    path("api/detect-sample/", views.detect_sample_api, name="detect_sample_api"),
    path("api/detect-drone/", views.detect_drone_api, name="detect_drone_api"),
]
