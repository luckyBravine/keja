from django.db import models

from listings.models import Listing


class Booking(models.Model):
    """
    Manages house booking
    """
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    date_booked = models.DateTimeField(auto_now_add=True)
    deposit = models.DecimalField(max_digits=10, decimal_places=2)
    

