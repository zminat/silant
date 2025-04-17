from django.db import models
from django.contrib.auth.models import User


class BaseReference(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Название")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class MachineModel(BaseReference):
    class Meta:
        verbose_name = "Модель техники"
        verbose_name_plural = "Модели техники"


class EngineModel(BaseReference):
    class Meta:
        verbose_name = "Модель двигателя"
        verbose_name_plural = "Модели двигателей"


class TransmissionModel(BaseReference):
    class Meta:
        verbose_name = "Модель трансмиссии"
        verbose_name_plural = "Модели трансмиссий"


class DriveAxleModel(BaseReference):
    class Meta:
        verbose_name = "Модель ведущего моста"
        verbose_name_plural = "Модели ведущих мостов"


class SteeringAxleModel(BaseReference):
    class Meta:
        verbose_name = "Модель управляемого моста"
        verbose_name_plural = "Модели управляемых мостов"


class MaintenanceType(BaseReference):
    class Meta:
        verbose_name = "Вид ТО"
        verbose_name_plural = "Виды ТО"


class FailureNode(BaseReference):
    class Meta:
        verbose_name = "Узел отказа"
        verbose_name_plural = "Узлы отказов"


class RecoveryMethod(BaseReference):
    class Meta:
        verbose_name = "Способ восстановления"
        verbose_name_plural = "Способы восстановления"


class ServiceCompany(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Название")
    description = models.TextField(blank=True, verbose_name="Описание")
    users = models.ManyToManyField(User, related_name="service_companies", verbose_name="Пользователи")
    service_manager = models.OneToOneField(User, on_delete=models.SET_NULL, null=True,
                                           related_name="service_company", verbose_name="Руководитель")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Сервисная компания"
        verbose_name_plural = "Сервисные компании"


class Machine(models.Model):
    serial_number = models.CharField(max_length=255, unique=True, verbose_name="Заводской номер машины")
    model = models.ForeignKey(MachineModel, on_delete=models.PROTECT, verbose_name="Модель техники")
    engine_model = models.ForeignKey(EngineModel, on_delete=models.PROTECT, verbose_name="Модель двигателя")
    engine_serial_number = models.CharField(max_length=255, verbose_name="Заводской номер двигателя")
    transmission_model = models.ForeignKey(TransmissionModel, on_delete=models.PROTECT,
                                           verbose_name="Модель трансмиссии")
    transmission_serial_number = models.CharField(max_length=255, verbose_name="Заводской номер трансмиссии")
    drive_axle_model = models.ForeignKey(DriveAxleModel, on_delete=models.PROTECT, verbose_name="Модель ведущего моста")
    drive_axle_serial_number = models.CharField(max_length=255, verbose_name="Заводской номер ведущего моста")
    steering_axle_model = models.ForeignKey(SteeringAxleModel, on_delete=models.PROTECT,
                                            verbose_name="Модель управляемого моста")
    steering_axle_serial_number = models.CharField(max_length=255, verbose_name="Заводской номер управляемого моста")
    contract_info = models.CharField(blank=True, default="", max_length=255, verbose_name="Договор поставки №, дата")
    shipment_date = models.DateField(verbose_name="Дата отгрузки с завода")
    consignee = models.CharField(max_length=255, verbose_name="Грузополучатель (конечный потребитель)")
    delivery_address = models.TextField(verbose_name="Адрес поставки (эксплуатации)")
    equipment = models.TextField(blank=True, null=True, verbose_name="Комплектация (доп. опции)")
    client = models.ForeignKey(User, on_delete=models.PROTECT, related_name='client_machines', verbose_name="Клиент")
    service_company = models.ForeignKey(ServiceCompany, on_delete=models.PROTECT, verbose_name="Сервисная компания")

    def __str__(self):
        return f"{self.serial_number}"

    class Meta:
        verbose_name = "Машина"
        verbose_name_plural = "Машины"


class Maintenance(models.Model):
    SELF_SERVICE = "Самостоятельно"
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='maintenances', verbose_name="Машина")
    maintenance_type = models.ForeignKey(MaintenanceType, on_delete=models.PROTECT, verbose_name="Вид ТО")
    maintenance_date = models.DateField(verbose_name="Дата проведения ТО")
    operating_time = models.PositiveIntegerField(verbose_name="Наработка, м/час")
    order_number = models.CharField(max_length=255, verbose_name="Номер заказ-наряда")
    order_date = models.DateField(verbose_name="Дата заказ-наряда")
    organization = models.ForeignKey(
        ServiceCompany,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Организация, проводившая ТО"
    )
    service_company = models.ForeignKey(
        ServiceCompany, on_delete=models.PROTECT, related_name='service_maintenances',
        verbose_name="Сервисная компания"
    )

    def get_organization_display(self):
        return self.SELF_SERVICE if self.organization is None else str(self.organization)

    def __str__(self):
        return f"ТО {self.machine.serial_number}"

    class Meta:
        verbose_name = "Техническое обслуживание"
        verbose_name_plural = "Технические обслуживания"


class Claim(models.Model):
    failure_date = models.DateField(verbose_name="Дата отказа")
    operating_time = models.PositiveIntegerField(verbose_name="Наработка, м/час")
    failure_node = models.ForeignKey(FailureNode, on_delete=models.PROTECT, verbose_name="Узел отказа")
    failure_description = models.TextField(verbose_name="Описание отказа")
    recovery_method = models.ForeignKey(RecoveryMethod, on_delete=models.PROTECT, verbose_name="Способ восстановления")
    spare_parts_used = models.TextField(blank=True, null=True, verbose_name="Используемые запасные части")
    recovery_date = models.DateField(verbose_name="Дата восстановления")
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='claims', verbose_name="Машина")
    service_company = models.ForeignKey(ServiceCompany, on_delete=models.PROTECT, related_name='service_claims',
                                        verbose_name="Сервисная компания")

    @property
    def downtime(self):
        return (self.recovery_date - self.failure_date).days

    def __str__(self):
        return f"Рекламация {self.machine.serial_number})"

    class Meta:
        verbose_name = "Рекламация"
        verbose_name_plural = "Рекламации"
