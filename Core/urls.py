from django.urls import path
from . import views

app_name = 'Core'

urlpatterns = [
    path('', views.redierccionar, name='redierccionar'),
    path('home/', views.home, name='home'),
]
