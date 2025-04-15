from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import (
    Machine, Maintenance, Claim, ServiceCompany,
    MachineModel, EngineModel, TransmissionModel, DriveAxleModel,
    SteeringAxleModel, MaintenanceType, FailureNode, RecoveryMethod
)


class ServiceCompanyInline(admin.StackedInline):
    model = ServiceCompany
    can_delete = False
    verbose_name_plural = 'Сервисные организации'


class CustomUserAdmin(UserAdmin):
    inlines = (ServiceCompanyInline,)


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('serial_number', 'model', 'shipment_date', 'client', 'service_company')
    search_fields = ('serial_number', 'model__name', 'client__username', 'service_company__name')
    list_filter = ('model', 'service_company')


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('maintenance_type', 'maintenance_date', 'machine', 'organization_display')
    search_fields = ('machine__serial_number', 'organization__name')
    list_filter = ('maintenance_type', 'organization__name')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "organization":
            kwargs["empty_label"] = self.model.SELF_SERVICE
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def organization_display(self, obj):
        return obj.get_organization_display()

    organization_display.admin_order_field = 'organization'
    organization_display.short_description = 'Организация'


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
