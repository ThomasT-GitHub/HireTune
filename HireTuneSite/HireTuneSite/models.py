from django.db import models
from django.contrib.auth.models import User


class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    discord_uid = models.CharField(max_length=50, null=True, blank=True)
    avatar_hash = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

class ApplicationStatus(models.TextChoices):
    SUBMITTED = 'SUB', 'Submitted'
    INTERVIEW = 'INT', 'Interview'
    REJECTED = 'REJ', 'Rejected'
    OFFER = 'OFF', 'Offer'
class JobApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="job_applications")
    resume = models.URLField()
    name = models.CharField(max_length=200)
    url = models.URLField()
    create_date = models.DateField(auto_now_add=True)  # auto-populate on creation
    status = models.CharField(
        max_length=3,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.SUBMITTED
    )
    comments = models.TextField(blank=True)  # allow comments to be empty

    def __str__(self):
        return self.name