from django.shortcuts import render
from django import forms
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from django.contrib.auth.models import Group, Permission
from .models import Machine, Maintenance, Claim, ServiceCompany
from .serializers import MachineSerializer, MaintenanceSerializer, ClaimSerializer, GroupSerializer, \
    PermissionSerializer




def homepage(request):
    return render(request, 'index.html')


class GroupViewSet(ReadOnlyModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class PermissionViewSet(ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer


class UserPermissionsView(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        permissions = user.get_all_permissions()
        return Response({'permissions': list(permissions)})


class PublicMachineInfoView(APIView):
    """
    APIView для предоставления публичного доступа к ограниченной информации о машине
    по заводскому номеру без необходимости авторизации
    """
    permission_classes = []  # Публичный доступ без авторизации

    def get(self, request):
        """
        Получение информации о машине по заводскому номеру
        """
        serial_number = request.query_params.get('serial_number', None)

        if not serial_number:
            return Response(
                {"error": "Необходимо указать заводской номер машины"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            machine = Machine.objects.get(serial_number=serial_number)

            # Ограничиваем выдаваемые данные только базовой информацией
            limited_data = {
                'serial_number': machine.serial_number,
                'model': {
                    'id': machine.model.id,
                    'name': machine.model.name,
                    'description': machine.model.description
                } if machine.model else None,
                'engine_model': {
                    'id': machine.engine_model.id,
                    'name': machine.engine_model.name,
                    'description': machine.engine_model.description
                } if machine.engine_model else None,
                'engine_serial_number': machine.engine_serial_number,
                'transmission_model': {
                    'id': machine.transmission_model.id,
                    'name': machine.transmission_model.name,
                    'description': machine.transmission_model.description
                } if machine.transmission_model else None,
                'transmission_serial_number': machine.transmission_serial_number,
                'drive_axle_model': {
                    'id': machine.drive_axle_model.id,
                    'name': machine.drive_axle_model.name,
                    'description': machine.drive_axle_model.description
                } if machine.drive_axle_model else None,
                'drive_axle_serial_number': machine.drive_axle_serial_number,
                'steering_axle_model': {
                    'id': machine.steering_axle_model.id,
                    'name': machine.steering_axle_model.name,
                    'description': machine.steering_axle_model.description
                } if machine.steering_axle_model else None,
                'steering_axle_serial_number': machine.steering_axle_serial_number
            }

            return Response(limited_data)

        except Machine.DoesNotExist:
            return Response(
                {"error": "Данных о машине с таким заводским номером нет в системе"},
                status=status.HTTP_404_NOT_FOUND
            )



class CustomDjangoPermission(DjangoModelPermissions):
    """
    Пользовательское разрешение на основе разрешений Django.
    Проверяет наличие соответствующих разрешений в зависимости от метода запроса.
    """
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
    serializer_class = MachineSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Machine.objects.none()

        # Суперпользователю показываем все машины
        if user.is_superuser:
            return Machine.objects.all()

        # Сервисной компании показываем закрепленные за ней машины
        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Machine.objects.filter(service_company=service_company)

        # Обычным клиентам показываем только их машины
        return Machine.objects.filter(client=user)


    def get_permissions(self):
        """
        Возвращает разрешения в зависимости от действия.
        """
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

    def get_permissions(self):
        return [IsAuthenticated()]


class ClaimViewSet(ReadOnlyModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Claim.objects.none()

        # Суперпользователю показываем все рекламации
        if user.is_superuser:
            return Claim.objects.all()

        # Сервисной компании показываем рекламации закрепленных за ней машин
        service_company = ServiceCompany.objects.filter(service_manager=user).first()
        if service_company:
            return Claim.objects.filter(machine__service_company=service_company)

        # Обычным клиентам показываем только их машины
        return Claim.objects.filter(machine__client=user)

    def get_permissions(self):
        """
        Возвращает разрешения в зависимости от действия.
        """
        return [IsAuthenticated(), CustomDjangoPermission()]

class MaintenanceForm(forms.ModelForm):
    organization = forms.ChoiceField(
        choices=[(Maintenance.SELF_SERVICE, "Самостоятельно")] + [(sc.name, sc.name) for sc in ServiceCompany.objects.all()],
        required=True
    )

    class Meta:
        model = Maintenance
        fields = '__all__'
