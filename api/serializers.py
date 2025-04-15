from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Machine, Maintenance, Claim, MachineModel, EngineModel, TransmissionModel,
    DriveAxleModel, SteeringAxleModel, MaintenanceType, FailureNode,
    RecoveryMethod, ServiceCompany
)


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
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name')

    def get_name(self, obj):
        if hasattr(obj, 'service_company') and obj.service_company:
            return obj.service_company.name
        elif obj.first_name:
            return obj.first_name
        else:
            return obj.username


class MaintenanceSerializer(serializers.ModelSerializer):
    maintenance_type = MaintenanceTypeSerializer(read_only=True)
    machine = serializers.SerializerMethodField()
    organization = serializers.ChoiceField(read_only=True, choices=[(Maintenance.SELF_SERVICE, "Самостоятельно")] + [
        (sc.name, sc.name) for sc in ServiceCompany.objects.all()
    ])

    def get_machine(self, obj):
        return {"serial_number": obj.machine.serial_number} if obj.machine else None

    class Meta:
        model = Maintenance
        fields = '__all__'


class ClaimSerializer(serializers.ModelSerializer):
    machine = serializers.SerializerMethodField()
    failure_node = FailureNodeSerializer(read_only=True)
    recovery_method = RecoveryMethodSerializer(read_only=True)
    service_company = ServiceCompanySerializer(read_only=True)
    downtime = serializers.IntegerField(read_only=True)  # Автоматически рассчитывается

    def get_machine(self, obj):
        return {"serial_number": obj.machine.serial_number} if obj.machine else None

    class Meta:
        model = Claim
        fields = '__all__'


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


class MachineListSerializer(serializers.ModelSerializer):
    model_id = serializers.PrimaryKeyRelatedField(source='model', read_only=True)
    engine_model_id = serializers.PrimaryKeyRelatedField(source='engine_model', read_only=True)
    transmission_model_id = serializers.PrimaryKeyRelatedField(source='transmission_model', read_only=True)
    drive_axle_model_id = serializers.PrimaryKeyRelatedField(source='drive_axle_model', read_only=True)
    steering_axle_model_id = serializers.PrimaryKeyRelatedField(source='steering_axle_model', read_only=True)
    service_company_id = serializers.PrimaryKeyRelatedField(source='service_company', read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(source='client', read_only=True)

    class Meta:
        model = Machine
        fields = [
            'id', 'serial_number',
            'model_id',
            'engine_model_id', 'engine_serial_number',
            'transmission_model_id', 'transmission_serial_number',
            'drive_axle_model_id', 'drive_axle_serial_number',
            'steering_axle_model_id', 'steering_axle_serial_number',
            'shipment_date', 'consignee', 'delivery_address', 'equipment',
            'service_company_id',
            'client_id'
        ]


class MachineLimitedListSerializer(serializers.ModelSerializer):
    model_id = serializers.PrimaryKeyRelatedField(source='model', read_only=True)
    engine_model_id = serializers.PrimaryKeyRelatedField(source='engine_model', read_only=True)
    transmission_model_id = serializers.PrimaryKeyRelatedField(source='transmission_model', read_only=True)
    drive_axle_model_id = serializers.PrimaryKeyRelatedField(source='drive_axle_model', read_only=True)
    steering_axle_model_id = serializers.PrimaryKeyRelatedField(source='steering_axle_model', read_only=True)

    class Meta:
        model = Machine
        fields = [
            'id', 'serial_number',
            'model_id',
            'engine_model_id', 'engine_serial_number',
            'transmission_model_id', 'transmission_serial_number',
            'drive_axle_model_id', 'drive_axle_serial_number',
            'steering_axle_model_id', 'steering_axle_serial_number'
        ]
