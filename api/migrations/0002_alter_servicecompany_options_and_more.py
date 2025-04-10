# Generated by Django 4.2.20 on 2025-03-19 12:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='servicecompany',
            options={},
        ),
        migrations.AddField(
            model_name='servicecompany',
            name='service_manager',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='service_company', to=settings.AUTH_USER_MODEL, verbose_name='Руководитель'),
        ),
        migrations.AddField(
            model_name='servicecompany',
            name='users',
            field=models.ManyToManyField(related_name='service_companies', to=settings.AUTH_USER_MODEL, verbose_name='Пользователи'),
        ),
        migrations.AlterField(
            model_name='servicecompany',
            name='description',
            field=models.TextField(blank=True, verbose_name='Описание'),
        ),
    ]
