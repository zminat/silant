from django.contrib import admin
from .models import (
    Machine, Maintenance, Claim, ServiceCompany,
    MachineModel, EngineModel, TransmissionModel, DriveAxleModel,
    SteeringAxleModel, MaintenanceType, FailureNode, RecoveryMethod
)


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('serial_number', 'model', 'shipment_date', 'client', 'service_company')
    search_fields = ('serial_number', 'model__name', 'client__username', 'service_company__name')
    list_filter = ('model', 'service_company')

@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('maintenance_type', 'maintenance_date', 'machine', 'service_company')
    search_fields = ('machine__serial_number', 'service_company__name')
    list_filter = ('maintenance_type', 'service_company')

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('failure_date', 'failure_node', 'machine', 'service_company', 'downtime')
    search_fields = ('machine__serial_number', 'failure_node__name', 'service_company__name')
    list_filter = ('failure_node', 'service_company')

@admin.register(ServiceCompany)
class ServiceCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(MachineModel)
class MachineModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(EngineModel)
class EngineModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(TransmissionModel)
class TransmissionModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(DriveAxleModel)
class DriveAxleModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(SteeringAxleModel)
class SteeringAxleModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(MaintenanceType)
class MaintenanceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(FailureNode)
class FailureNodeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(RecoveryMethod)
class RecoveryMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)