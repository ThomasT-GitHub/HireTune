from django.apps import AppConfig

class HireTuneConfig(AppConfig):
    name = 'HireTuneSite'

    def ready(self):
        import HireTuneSite.signals

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'HireTuneSite.accounts'