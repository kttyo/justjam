from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class NoSignupAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        # 通常の signup は禁止
        return False


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_auto_signup_allowed(self, request, sociallogin):
        # ソーシャルログインによる自動サインアップは許可
        return True
