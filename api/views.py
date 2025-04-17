from django.db.models import Case, When, Value, IntegerField
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from .models import Machine, Maintenance, Claim, ServiceCompany, MachineModel, EngineModel, TransmissionModel, \
    DriveAxleModel, SteeringAxleModel, MaintenanceType, FailureNode, RecoveryMethod
from .serializers import MachineSerializer, MachineListSerializer, MachineLimitedListSerializer, MaintenanceSerializer, \
    MaintenanceListSerializer, ClaimSerializer, ClaimListSerializer, MachineModelSerializer, \
    EngineModelSerializer, TransmissionModelSerializer, DriveAxleModelSerializer, SteeringAxleModelSerializer, \
    MaintenanceTypeSerializer, FailureNodeSerializer, RecoveryMethodSerializer, UserSerializer, \
    ServiceCompanySerializer


def homepage(request, id=None):
    return render(request, 'index.html')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user

    if user.is_staff:
        user_type = 'manager'
        organization_name = 'Администратор'
        return Response({
            'username': user.username,
            'userType': user_type,
            'organizationName': organization_name
        })

    service_company = ServiceCompany.objects.filter(service_manager=user).first()

    is_service_user = ServiceCompany.objects.filter(users__id=user.id).exists()

    if service_company:
        user_type = 'service_company'
        organization_name = service_company.name
    elif is_service_user:
        user_type = 'service_company'
        organization_name = ServiceCompany.objects.filter(users__id=user.id).first().name
    else:
        user_type = 'client'
        organization_name = user.first_name or user.username

    return Response({
        'username': user.username,
        'userType': user_type,
        'organizationName': organization_name
    })


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
    serializer_class = MachineSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public_info(self, request):
        serial_number = request.query_params.get('serial_number', None)
        if not serial_number:
            return Response(
                {"error": "Необходимо указать заводской номер машины"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            machines = MachineLimitedListSerializer(
                Machine.objects.filter(serial_number=serial_number).order_by('shipment_date'), many=True).data
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
        serial_number = self.request.query_params.get('serial_number', None)

        if not user.is_authenticated:
            queryset = Machine.objects.none()
        elif user.is_staff:
            queryset = Machine.objects.all()
        else:
            service_company = ServiceCompany.objects.filter(service_manager=user).first()
            if service_company:
                queryset = Machine.objects.filter(service_company=service_company)
            else:
                queryset = Machine.objects.filter(client=user)

        if serial_number:
            queryset = queryset.filter(serial_number__icontains=serial_number)

        return queryset.order_by('shipment_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        machines = MachineListSerializer(queryset, many=True).data

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
        serial_number = self.request.query_params.get('serial_number', None)

        if not user.is_authenticated:
            queryset = Maintenance.objects.none()
        elif user.is_staff:
            queryset = Maintenance.objects.all()
        else:
            service_company = ServiceCompany.objects.filter(service_manager=user).first()
            if service_company:
                queryset = Maintenance.objects.filter(machine__service_company=service_company)
            else:
                queryset = Maintenance.objects.filter(machine__client=user)

        if serial_number:
            queryset = queryset.filter(machine__serial_number__icontains=serial_number)

        return queryset.order_by('maintenance_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        maintenances = MaintenanceListSerializer(queryset, many=True).data

        dictionaries = {
            'machines': MachineLimitedListSerializer(Machine.objects.all().order_by('serial_number'), many=True).data,
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

    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()
        if 'service_company' not in request_data and 'machine' in request_data:
            try:
                machine_id = request_data['machine']
                machine = Machine.objects.get(id=machine_id)

                if machine.service_company:
                    request_data['service_company'] = machine.service_company.id
            except Machine.DoesNotExist:
                pass

        request._full_data = request_data
        return super().create(request, *args, **kwargs)


class ClaimViewSet(ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated, CustomDjangoPermission]

    def get_queryset(self):
        user = self.request.user
        serial_number = self.request.query_params.get('serial_number', None)

        if not user.is_authenticated:
            queryset = Claim.objects.none()
        elif user.is_staff:
            queryset = Claim.objects.all()
        else:
            service_company = ServiceCompany.objects.filter(service_manager=user).first()
            if service_company:
                queryset = Claim.objects.filter(machine__service_company=service_company)
            else:
                queryset = Claim.objects.filter(machine__client=user)

        if serial_number:
            queryset = queryset.filter(machine__serial_number__icontains=serial_number)

        return queryset.order_by('failure_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        claims = ClaimListSerializer(queryset, many=True).data

        dictionaries = {
            'machines': MachineLimitedListSerializer(Machine.objects.all().order_by('serial_number'), many=True).data,
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

    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()
        if 'service_company' not in request_data and 'machine' in request_data:
            try:
                machine_id = request_data['machine']
                machine = Machine.objects.get(id=machine_id)

                if machine.service_company:
                    request_data['service_company'] = machine.service_company.id
            except Machine.DoesNotExist:
                pass

        request._full_data = request_data
        return super().create(request, *args, **kwargs)
