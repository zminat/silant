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
        queryset = Machine.objects.all()

        # Получаем параметры из URL
        service_company_pk = self.kwargs.get('service_company_pk')
        user_pk = self.kwargs.get('pk')  # параметр для /api/user/<int:pk>/machine

        # Применяем фильтрацию по сервисной компании, если указана
        if service_company_pk:
            queryset = queryset.filter(service_company_id=service_company_pk)

        # Применяем фильтрацию по пользователю, если указана
        if user_pk:
            queryset = queryset.filter(client_id=user_pk)

        # Проверка прав доступа
        if user.is_superuser or user.has_perm('machines.view_machine'):
            return queryset

        # Для пользователей без явных разрешений ограничиваем доступ
        return Machine.objects.none()

    def get_permissions(self):
        """
        Возвращает разрешения в зависимости от действия.
        """
        return [IsAuthenticated(), CustomDjangoPermission()]


class MaintenanceViewSet(ReadOnlyModelViewSet):
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        user = self.request.user

        # Для суперпользователей возвращаем все объекты
        if user.is_superuser:
            return Maintenance.objects.all()

        # Зарегистрированным пользователям возвращаем только те объекты, к которым у них есть доступ
        # на основе их разрешений
        if user.has_perm('maintenance.view_maintenance'):
            return Maintenance.objects.all()

        # Для пользователей без явных разрешений ограничиваем доступ
        return Maintenance.objects.none()

    def get_permissions(self):
        """
        Возвращает разрешения в зависимости от действия.
        """
        return [IsAuthenticated(), CustomDjangoPermission()]


class ClaimViewSet(ReadOnlyModelViewSet):
    serializer_class = ClaimSerializer

    def get_queryset(self):
        user = self.request.user

        # Для суперпользователей возвращаем все объекты
        if user.is_superuser:
            return Claim.objects.all()

        # Зарегистрированным пользователям возвращаем только те объекты, к которым у них есть доступ
        # на основе их разрешений
        if user.has_perm('claims.view_claim'):
            return Claim.objects.all()

        # Для пользователей без явных разрешений ограничиваем доступ
        return Claim.objects.none()

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
