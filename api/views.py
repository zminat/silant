from django.db.models import Case, When, Value, IntegerField
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from .models import Machine, Maintenance, Claim, ServiceCompany, MachineModel, EngineModel, TransmissionModel, \
    DriveAxleModel, SteeringAxleModel, MaintenanceType, FailureNode, RecoveryMethod
from .serializers import MaintenanceSerializer, ClaimSerializer, MachineModelSerializer, \
    EngineModelSerializer, TransmissionModelSerializer, DriveAxleModelSerializer, SteeringAxleModelSerializer, \
    MaintenanceTypeSerializer, FailureNodeSerializer, RecoveryMethodSerializer, MachineSerializer, UserSerializer, \
    MachineLimitedSerializer, ServiceCompanySerializer


def homepage(request, id=None):
    return render(request, 'index.html')


class BaseReferenceViewSet(ReadOnlyModelViewSet):
    permission_classes = [AllowAny]


class MachineModelViewSet(BaseReferenceViewSet):
    queryset = MachineModel.objects.all()
    serializer_class = MachineModelSerializer


class EngineModelViewSet(BaseReferenceViewSet):
    queryset = EngineModel.objects.all()
    serializer_class = EngineModelSerializer


class TransmissionModelViewSet(BaseReferenceViewSet):
    queryset = TransmissionModel.objects.all()
    serializer_class = TransmissionModelSerializer


class DriveAxleModelViewSet(BaseReferenceViewSet):
    queryset = DriveAxleModel.objects.all()
    serializer_class = DriveAxleModelSerializer


class SteeringAxleModelViewSet(BaseReferenceViewSet):
    queryset = SteeringAxleModel.objects.all()
    serializer_class = SteeringAxleModelSerializer


class MaintenanceTypeViewSet(BaseReferenceViewSet):
    queryset = MaintenanceType.objects.all()
    serializer_class = MaintenanceTypeSerializer


class FailureNodeViewSet(BaseReferenceViewSet):
    queryset = FailureNode.objects.all()
    serializer_class = FailureNodeSerializer


class RecoveryMethodViewSet(BaseReferenceViewSet):
    queryset = RecoveryMethod.objects.all()
    serializer_class = RecoveryMethodSerializer


class ServiceCompanyViewSet(BaseReferenceViewSet):
    queryset = ServiceCompany.objects.all()
    serializer_class = ServiceCompanySerializer


class CustomDjangoPermission(DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


class MachineViewSet(ModelViewSet):

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public_info(self, request):
        serial_number = request.query_params.get('serial_number', None)
        if not serial_number:
            return Response(
                {"error": "Необходимо указать заводской номер машины"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            machines = MachineLimitedSerializer(Machine.objects.filter(serial_number=serial_number).order_by('shipment_date'), many=True).data
            dictionaries = {
                'models': MachineModelSerializer(MachineModel.objects.all().order_by('name'), many=True).data,
                'engine_models': EngineModelSerializer(EngineModel.objects.all().order_by('name'), many=True).data,
                'transmission_models': TransmissionModelSerializer(TransmissionModel.objects.all().order_by('name'),
                                                                   many=True).data,
                'drive_axle_models': DriveAxleModelSerializer(DriveAxleModel.objects.all().order_by('name'),
                                                              many=True).data,
                'steering_axle_models': SteeringAxleModelSerializer(SteeringAxleModel.objects.all().order_by('name'),
                                                                    many=True).data,
            }

            permissions = {
                'can_create': request.user.has_perm('machines.add_machine'),
                'can_edit': request.user.has_perm('machines.change_machine'),
                'can_delete': request.user.has_perm('machines.delete_machine'),
            }

            return Response({
                'machines': machines,
                'dictionaries': dictionaries,
                'permissions': permissions
            })

        except Machine.DoesNotExist:
            return Response(
                {"error": f"Машина с заводским номером {serial_number} не найдена"},
                status=status.HTTP_404_NOT_FOUND
            )

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Machine.objects.none()

        if user.is_staff:
            return Machine.objects.all().order_by('shipment_date')

        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Machine.objects.filter(service_company=service_company).order_by('shipment_date')

        return Machine.objects.filter(client=user).order_by('shipment_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        machines = MachineSerializer(queryset, many=True).data

        dictionaries = {
            'models': MachineModelSerializer(MachineModel.objects.all().order_by('name'), many=True).data,
            'engine_models': EngineModelSerializer(EngineModel.objects.all().order_by('name'), many=True).data,
            'transmission_models': TransmissionModelSerializer(TransmissionModel.objects.all().order_by('name'),
                                                               many=True).data,
            'drive_axle_models': DriveAxleModelSerializer(DriveAxleModel.objects.all().order_by('name'),
                                                          many=True).data,
            'steering_axle_models': SteeringAxleModelSerializer(SteeringAxleModel.objects.all().order_by('name'),
                                                                many=True).data,
            'service_companies': ServiceCompanySerializer(ServiceCompany.objects.all().order_by('name'),
                                                          many=True).data,
            'clients': UserSerializer(User.objects.annotate(
                first_name_null=Case(When(first_name='', then=Value(1)), When(first_name__isnull=True, then=Value(1)),
                                     default=Value(0), output_field=IntegerField())).order_by('first_name_null',
                                                                                              'first_name', 'username'),
                                      many=True).data,
        }

        permissions = {
            'can_create': request.user.has_perm('api.add_machine'),
            'can_edit': request.user.has_perm('api.change_machine'),
            'can_delete': request.user.has_perm('api.delete_machine'),
        }

        return Response({
            'machines': machines,
            'dictionaries': dictionaries,
            'permissions': permissions
        })

    def get_permissions(self):
        if self.action == 'public_info':
            return [AllowAny()]
        return [IsAuthenticated(), CustomDjangoPermission()]


class MaintenanceViewSet(ModelViewSet):
    serializer_class = MaintenanceSerializer
    permission_classes = [IsAuthenticated, CustomDjangoPermission]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Maintenance.objects.none()

        if user.is_staff:
            return Maintenance.objects.all().order_by('maintenance_date')

        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Maintenance.objects.filter(machine__service_company=service_company).order_by('maintenance_date')

        return Maintenance.objects.filter(machine__client=user).order_by('maintenance_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        maintenances = self.get_serializer(queryset, many=True).data

        dictionaries = {
            'machines': MachineLimitedSerializer(Machine.objects.all().order_by('serial_number'), many=True).data,
            'maintenance_types': MaintenanceTypeSerializer(MaintenanceType.objects.all().order_by('name'),
                                                           many=True).data,
            'organizations': [{'id': None, 'name': Maintenance.SELF_SERVICE}] + ServiceCompanySerializer(
                ServiceCompany.objects.all().order_by('name'), many=True).data,
        }

        permissions = {
            'can_create': request.user.has_perm('api.add_maintenance'),
            'can_edit': request.user.has_perm('api.change_maintenance'),
            'can_delete': request.user.has_perm('api.delete_maintenance'),
        }

        return Response({
            'maintenances': maintenances,
            'dictionaries': dictionaries,
            'permissions': permissions
        })


class ClaimViewSet(ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated, CustomDjangoPermission]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Claim.objects.none()

        if user.is_staff:
            return Claim.objects.all().order_by('failure_date')

        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Claim.objects.filter(machine__service_company=service_company).order_by('failure_date')

        return Claim.objects.filter(machine__client=user).order_by('failure_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        claims = self.get_serializer(queryset, many=True).data

        dictionaries = {
            'machines': MachineLimitedSerializer(Machine.objects.all().order_by('serial_number'), many=True).data,
            'failure_nodes': FailureNodeSerializer(FailureNode.objects.all().order_by('name'), many=True).data,
            'recovery_methods': RecoveryMethodSerializer(RecoveryMethod.objects.all().order_by('name'), many=True).data,
        }

        permissions = {
            'can_create': request.user.has_perm('api.add_claim'),
            'can_edit': request.user.has_perm('api.change_claim'),
            'can_delete': request.user.has_perm('api.delete_claim'),
        }

        return Response({
            'claims': claims,
            'dictionaries': dictionaries,
            'permissions': permissions
        })
