# Generated migration to increase filename length limits

import pdf.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pdf', '0017_increase_pdf_file_field_max_lenght'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tag',
            name='name',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='pdf',
            name='name',
            field=models.CharField(max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='pdf',
            name='file',
            field=models.FileField(max_length=1000, upload_to=pdf.models.get_file_path),
        ),
        migrations.AlterField(
            model_name='pdf',
            name='file_directory',
            field=models.CharField(
                blank=True,
                help_text='Optional, save file in a sub directory of the pdf directory, e.g: important/pdfs',
                max_length=240,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='sharedpdf',
            name='name',
            field=models.CharField(max_length=300, null=True),
        ),
    ]