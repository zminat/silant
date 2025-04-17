from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import (
    user_info, MachineViewSet, MaintenanceViewSet, ClaimViewSet, MachineModelViewSet, EngineModelViewSet,
    TransmissionModelViewSet, DriveAxleModelViewSet, SteeringAxleModelViewSet, MaintenanceTypeViewSet,
    FailureNodeViewSet, RecoveryMethodViewSet, ServiceCompanyViewSet
)

router = DefaultRouter()
router.register(r'machine-models', MachineModelViewSet, basename='machine-model')
router.register(r'engine-models', EngineModelViewSet, basename='engine-model')
router.register(r'transmission-models', TransmissionModelViewSet, basename='transmission-model')
router.register(r'drive-axle-models', DriveAxleModelViewSet, basename='drive-axle-model')
router.register(r'steering-axle-models', SteeringAxleModelViewSet, basename='steering-axle-model')
router.register(r'maintenance-types', MaintenanceTypeViewSet, basename='maintenance-type')
router.register(r'failure-nodes', FailureNodeViewSet, basename='failure-node')
router.register(r'recovery-methods', RecoveryMethodViewSet, basename='recovery-method')
router.register(r'service-companies', ServiceCompanyViewSet, basename='service-company')
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')
router.register(r'claims', ClaimViewSet, basename='claim')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/user/info/', user_info, name='user-info'),
]
