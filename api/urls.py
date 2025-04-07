from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tutorial.quickstart.views import UserViewSet

from api.views import (
    LoginView, CheckAuthView, LogoutView, MachineViewSet, MaintenanceViewSet, ClaimViewSet, PublicMachineInfoView
)

router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')
router.register(r'claims', ClaimViewSet, basename='claim')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('check-auth/', CheckAuthView.as_view(), name='check-auth'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('public-machine-info/', PublicMachineInfoView.as_view(), name='public-machine-info'),
    path('auth/', include('rest_framework.urls')),
    path('user/', UserViewSet.as_view({'get': 'list'}), name='user-list'),
    path('user/<int:pk>/machine', MachineViewSet.as_view({'get': 'list'}), name='user-machine-list'),

    # Детализированные маршруты по связанным объектам
    path('machines/<str:serial_number>/maintenances/',
         MaintenanceViewSet.as_view({'get': 'list'}),
         name='machine-maintenances'),
    path('machines/<str:serial_number>/claims/',
         ClaimViewSet.as_view({'get': 'list'}),
         name='machine-claims'),
    path('service-companies/<int:service_company_pk>/machines/',
         MachineViewSet.as_view({'get': 'list'}),
         name='service-company-machines'),
    path('', include(router.urls)),
]