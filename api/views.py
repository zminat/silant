from django.contrib.auth.models import User
from django.shortcuts import render
from django import forms
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Machine, Maintenance, Claim, ServiceCompany, MachineModel, EngineModel, TransmissionModel, \
    DriveAxleModel, SteeringAxleModel, MaintenanceType, FailureNode, RecoveryMethod
from .serializers import MaintenanceSerializer, ClaimSerializer, MachineModelSerializer, \
    EngineModelSerializer, TransmissionModelSerializer, DriveAxleModelSerializer, SteeringAxleModelSerializer, \
    MaintenanceTypeSerializer, FailureNodeSerializer, RecoveryMethodSerializer, MachineListSerializer, UserSerializer, \
    MachineLimitedListSerializer, ServiceCompanySerializer


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


class MachineViewSet(ReadOnlyModelViewSet):
    serializer_class = MachineListSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public_info(self, request):
        serial_number = request.query_params.get('serial_number', None)
        if not serial_number:
            return Response(
                {"error": "Необходимо указать заводской номер машины"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            machines = MachineLimitedListSerializer(Machine.objects.filter(serial_number=serial_number), many=True).data
            dictionaries = {
                'models': MachineModelSerializer(MachineModel.objects.all(), many=True).data,
                'engine_models': EngineModelSerializer(EngineModel.objects.all(), many=True).data,
                'transmission_models': TransmissionModelSerializer(TransmissionModel.objects.all(), many=True).data,
                'drive_axle_models': DriveAxleModelSerializer(DriveAxleModel.objects.all(), many=True).data,
                'steering_axle_models': SteeringAxleModelSerializer(SteeringAxleModel.objects.all(), many=True).data,
            }

            permissions = {
                'can_edit': request.user.has_perm('machines.change_machine'),
                'can_delete': request.user.has_perm('machines.delete_machine'),
                'can_create': request.user.has_perm('machines.add_machine'),
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

        if user.is_superuser:
            return Machine.objects.all()

        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Machine.objects.filter(service_company=service_company)

        return Machine.objects.filter(client=user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        machines = self.get_serializer(queryset, many=True).data

        dictionaries = {
            'models': MachineModelSerializer(MachineModel.objects.all(), many=True).data,
            'engine_models': EngineModelSerializer(EngineModel.objects.all(), many=True).data,
            'transmission_models': TransmissionModelSerializer(TransmissionModel.objects.all(), many=True).data,
            'drive_axle_models': DriveAxleModelSerializer(DriveAxleModel.objects.all(), many=True).data,
            'steering_axle_models': SteeringAxleModelSerializer(SteeringAxleModel.objects.all(), many=True).data,
            'service_companies': ServiceCompanySerializer(ServiceCompany.objects.all(), many=True).data,
            'clients': UserSerializer(User.objects.all(), many=True).data,
        }

        permissions = {
            'can_edit': request.user.has_perm('machines.change_machine'),
            'can_delete': request.user.has_perm('machines.delete_machine'),
            'can_create': request.user.has_perm('machines.add_machine'),
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


class MaintenanceViewSet(ReadOnlyModelViewSet):
    serializer_class = MaintenanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Проверяем аутентификацию
        if not user.is_authenticated:
            return Maintenance.objects.none()

        # Для суперпользователя показываем все ТО
        if user.is_superuser:
            return Maintenance.objects.all()

        # Сервисной компании показываем ТО закрепленных за ней машин
        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Maintenance.objects.filter(machine__service_company=service_company)

        # Для клиентов показываем ТО только их машин
        return Maintenance.objects.filter(machine__client=user)


class ClaimViewSet(ReadOnlyModelViewSet):
    serializer_class = ClaimSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Claim.objects.none()

        if user.is_superuser:
            return Claim.objects.all()

        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Claim.objects.filter(machine__service_company=service_company)

        return Claim.objects.filter(machine__client=user)

    def get_permissions(self):
        return [IsAuthenticated(), CustomDjangoPermission()]


class MaintenanceForm(forms.ModelForm):
    organization = forms.ChoiceField(
        choices=[(Maintenance.SELF_SERVICE, "Самостоятельно")] + [(sc.name, sc.name) for sc in
                                                                  ServiceCompany.objects.all()],
        required=True
    )

    class Meta:
        model = Maintenance
        fields = '__all__'
