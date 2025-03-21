"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tutorial.quickstart.views import UserViewSet

from api.views import (
    homepage, MachineViewSet, MaintenanceViewSet, ClaimViewSet, PublicMachineInfoView
)

router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')
router.register(r'claims', ClaimViewSet, basename='claim')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', homepage, name='home'),
    path('api/', include(router.urls)),
    ]

urlpatterns += [
    # API аутентификации и пользовательские эндпоинты
    path('api/public-machine-info/', PublicMachineInfoView.as_view(), name='public-machine-info'),
    path('api/auth/', include('rest_framework.urls')),
    path('api/user/', UserViewSet.as_view({'get': 'list'}), name='user-list'),
    path('api/user/<int:pk>/machine', MachineViewSet.as_view({'get': 'list'}), name='user-machine-list'),

    # Детализированные маршруты по связанным объектам
    path('api/machines/<str:serial_number>/maintenances/',
         MaintenanceViewSet.as_view({'get': 'list'}),
         name='machine-maintenances'),
    path('api/machines/<str:serial_number>/claims/',
         ClaimViewSet.as_view({'get': 'list'}),
         name='machine-claims'),
    path('api/service-companies/<int:service_company_pk>/machines/',
         MachineViewSet.as_view({'get': 'list'}),
         name='service-company-machines'),
]