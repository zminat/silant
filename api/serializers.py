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


class MachineSerializer(serializers.ModelSerializer):
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


class MachineLimitedSerializer(serializers.ModelSerializer):
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


class MaintenanceSerializer(serializers.ModelSerializer):
    machine_id = serializers.PrimaryKeyRelatedField(source='machine', read_only=True)
    maintenance_type_id = serializers.PrimaryKeyRelatedField(source='maintenance_type', read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(source='organization', read_only=True)

    class Meta:
        model = Maintenance
        fields = [
            'id', 'machine_id',
            'maintenance_type_id',
            'maintenance_date', 'operating_time',
            'order_number', 'order_date',
            'organization_id'
        ]


class ClaimSerializer(serializers.ModelSerializer):
    machine_id = serializers.PrimaryKeyRelatedField(source='machine', read_only=True)
    failure_node_id = serializers.PrimaryKeyRelatedField(source='failure_node', read_only=True)
    recovery_method_id = serializers.PrimaryKeyRelatedField(source='recovery_method', read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id', 'machine_id',
            'failure_date',
            'operating_time', 'failure_node_id',
            'failure_description', 'recovery_method_id',
            'spare_parts_used', 'recovery_date'
        ]
