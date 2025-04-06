from HireTuneSite.accounts.models import Account

def update_discord_data(backend, user, response, *args, **kwargs):
    if backend.name == 'discord':
        account, created = Account.objects.get_or_create(user=user)
        account.discord_uid = response.get('id')
        account.avatar_hash = response.get('avatar')
        account.save()
