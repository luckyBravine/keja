# Generated manually for SavedListing model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('listings', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedListing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('listing', models.ForeignKey(help_text='Saved listing', on_delete=django.db.models.deletion.CASCADE, related_name='saved_by', to='listings.listing')),
                ('user', models.ForeignKey(help_text='User who saved the listing', on_delete=django.db.models.deletion.CASCADE, related_name='saved_listings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Saved Listing',
                'verbose_name_plural': 'Saved Listings',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='savedlisting',
            constraint=models.UniqueConstraint(fields=('user', 'listing'), name='listings_savedlisting_unique_user_listing'),
        ),
        migrations.AddIndex(
            model_name='savedlisting',
            index=models.Index(fields=['user'], name='listings_sav_user_id_7e0f0d_idx'),
        ),
    ]
