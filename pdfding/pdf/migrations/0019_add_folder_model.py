# Generated manually for folder functionality

from django.db import migrations, models
import django.db.models.deletion
from uuid import uuid4


class Migration(migrations.Migration):

    dependencies = [
        ('pdf', '0018_increase_all_filename_length_limits'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Folder',
            fields=[
                ('id', models.UUIDField(default=uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, help_text='Optional folder description', null=True)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.profile')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subfolders', to='pdf.folder')),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='pdf',
            name='folder',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pdfs', to='pdf.folder'),
        ),
    ]