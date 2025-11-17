from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm

# -----------------------
# 管理者ログイン用
# -----------------------
class LoginForm(AuthenticationForm):
    username = forms.EmailField(label="Email")  # ログインIDをemailに変更


# -----------------------
# 管理者アカウント作成用
# -----------------------
class CustomUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput
    )
    password2 = forms.CharField(
        label="Password confirmation",
        widget=forms.PasswordInput
    )

    class Meta:
        model = get_user_model()
        fields = ["email", "name"]

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords do not match.")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        # is_staff は必要に応じて設定
        user.is_staff = True
        if commit:
            user.save()
        return user
