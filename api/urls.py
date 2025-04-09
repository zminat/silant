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
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('check-auth/', CheckAuthView.as_view(), name='check-auth'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('public-machine-info/', PublicMachineInfoView.as_view(), name='public-machine-info'),
    path('auth/', include('rest_framework.urls')),
    path('user/', UserViewSet.as_view({'get': 'list'}), name='user-list'),
    path('user/machines', MachineViewSet.as_view({'get': 'list'}), name='user-machines'),
    path('user/maintenances', MaintenanceViewSet.as_view({'get': 'list'}), name='user-maintenances'),
    path('user/claims', ClaimViewSet.as_view({'get': 'list'}), name='user-claims'),
    path('user/<int:pk>/machine', MachineViewSet.as_view({'get': 'list'}), name='user-machine-list'),
    # path('service-companies/<int:service_company_pk>/machines/',
    #      MachineViewSet.as_view({'get': 'list'}),
    #      name='service-company-machines'),
    path('machines/<str:serial_number>/maintenances/',
         MaintenanceViewSet.as_view({'get': 'list'}),
         name='machine-maintenances'),
    path('machines/<str:serial_number>/claims/',
         ClaimViewSet.as_view({'get': 'list'}),
         name='machine-claims'),

]