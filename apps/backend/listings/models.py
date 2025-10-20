from django.db import models


AVAILABILITY_CHOICE = [
        ('ready_for_occupancy', 'Ready To Occupy'),
        ('pending', 'Pending'),
        ('occupied', 'Occupied')
        ]


class Listing(models.Model):
    """
    Keep track of house listings
    """
    area_name = models.CharField(max_length=10)
    building_name = models.CharField(max_length=10)
    house_size = models.CharField(max_length=80)
    house_rent = models.IntegerField(default=0)
    contact_info = models.CharField(maxlength=40)
    amenities = models.CharField(maxlength=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    availability = models.CharField(
            max_length=100,
            choices=AVAILABILITY_CHOICES,
            unique=True
            )

    def __str__(self):
        return f"{self.area_name} {self.house_size} {self.contact_info}"
