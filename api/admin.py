from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import (
    Machine, Maintenance, Claim, ServiceCompany,
    MachineModel, EngineModel, TransmissionModel, DriveAxleModel,
    SteeringAxleModel, MaintenanceType, FailureNode, RecoveryMethod
)

# Связь пользователя с сервисной компанией
class ServiceCompanyInline(admin.StackedInline):
    model = ServiceCompany
    can_delete = False
    verbose_name_plural = 'Сервисные организации'

class CustomUserAdmin(UserAdmin):
    inlines = (ServiceCompanyInline,)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Фильтрация объектов по сервисной компании
class RestrictedAdminMixin:
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'servicecompany'):
            return qs.filter(service_company=request.user.servicecompany)
        return qs.none()


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin, RestrictedAdminMixin):
    list_display = ('serial_number', 'model', 'shipment_date', 'client', 'service_company')
    search_fields = ('serial_number', 'model__name', 'client__username', 'service_company__name')
    list_filter = ('model', 'service_company')

@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin, RestrictedAdminMixin):
    list_display = ('maintenance_type', 'maintenance_date', 'machine', 'organization')
    search_fields = ('machine__serial_number', 'organization')
    list_filter = ('maintenance_type', 'organization')

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        """Динамически обновляем список компаний, включая 'Самостоятельно'."""
        if db_field.name == "organization":
            kwargs["choices"] = [(Maintenance.SELF_SERVICE, "Самостоятельно")] + [
                (sc.name, sc.name) for sc in ServiceCompany.objects.all()
            ]
        return super().formfield_for_choice_field(db_field, request, **kwargs)


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin, RestrictedAdminMixin):
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