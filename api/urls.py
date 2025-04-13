from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import (
    MachineViewSet, MaintenanceViewSet, ClaimViewSet, PublicMachineInfoView
)

router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')
router.register(r'claims', ClaimViewSet, basename='claim')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('public-machine-info/', PublicMachineInfoView.as_view(), name='public-machine-info'),
]