from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from HireTuneSite.accounts.models import Account

@receiver(post_save, sender=User)
def create_or_update_user_account(sender, instance, created, **kwargs):
    if created:
        Account.objects.create(user=instance)
    else:
        instance.account.save()