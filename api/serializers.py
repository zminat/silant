from rest_framework import serializers
from django.contrib.auth.models import User, Group, Permission
from .models import (
    Machine, Maintenance, Claim, MachineModel, EngineModel, TransmissionModel,
    DriveAxleModel, SteeringAxleModel, MaintenanceType, FailureNode,
    RecoveryMethod, ServiceCompany
)


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']


class GroupSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name']


# Базовый сериализатор для справочников
class BaseReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'name', 'description')

class MachineModelSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = MachineModel

class EngineModelSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = EngineModel

class TransmissionModelSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = TransmissionModel

class DriveAxleModelSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = DriveAxleModel

class SteeringAxleModelSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = SteeringAxleModel

class MaintenanceTypeSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = MaintenanceType

class FailureNodeSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = FailureNode

class RecoveryMethodSerializer(BaseReferenceSerializer):
    class Meta(BaseReferenceSerializer.Meta):
        model = RecoveryMethod

class ServiceCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCompany
        fields = ['id', 'name', 'description']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'role')

# Сериализатор для технического обслуживания
class MaintenanceSerializer(serializers.ModelSerializer):
    maintenance_type = MaintenanceTypeSerializer(read_only=True)
    organization = serializers.ChoiceField(read_only=True, choices=[(Maintenance.SELF_SERVICE, "Самостоятельно")] + [
        (sc.name, sc.name) for sc in ServiceCompany.objects.all()
    ])

    class Meta:
        model = Maintenance
        fields = '__all__'

# Сериализатор для рекламаций
class ClaimSerializer(serializers.ModelSerializer):
    failure_node = FailureNodeSerializer(read_only=True)
    recovery_method = RecoveryMethodSerializer(read_only=True)
    service_company = ServiceCompanySerializer(read_only=True)
    downtime = serializers.IntegerField(read_only=True)  # Автоматически рассчитывается

    class Meta:
        model = Claim
        fields = '__all__'

# Сериализатор для машины
class MachineSerializer(serializers.ModelSerializer):
    model = MachineModelSerializer(read_only=True)
    engine_model = EngineModelSerializer(read_only=True)
    transmission_model = TransmissionModelSerializer(read_only=True)
    drive_axle_model = DriveAxleModelSerializer(read_only=True)
    steering_axle_model = SteeringAxleModelSerializer(read_only=True)
    service_company = ServiceCompanySerializer(read_only=True)
    client = UserSerializer(read_only=True)
    maintenances = MaintenanceSerializer(many=True, read_only=True)
    claims = ClaimSerializer(many=True, read_only=True)

    class Meta:
        model = Machine
        fields = '__all__'
