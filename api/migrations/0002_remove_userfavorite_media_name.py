# Generated by Django 4.1.4 on 2022-12-11 12:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userfavorite',
            name='media_name',
        ),
    ]
