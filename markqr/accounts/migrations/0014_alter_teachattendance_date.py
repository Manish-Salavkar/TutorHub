# Generated by Django 5.0.4 on 2024-04-27 16:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0013_alter_teachattendance_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teachattendance',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
