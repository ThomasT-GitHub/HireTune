from django.apps import AppConfig

class HireTuneConfig(AppConfig):
    name = 'HireTuneSite'

    def ready(self):
        import HireTuneSite.signals