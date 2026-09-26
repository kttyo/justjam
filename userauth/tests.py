from unittest.mock import patch

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .forms import CustomUserCreationForm

PROXY_LOGIN_URL = "/api/token/proxy/"
TEST_SECRET = "test-internal-secret"


@override_settings(INTERNAL_API_SECRET=TEST_SECRET)
class ProxyLoginInternalSecretTests(TestCase):
    """/api/token/proxy/ の X-Internal-Secret ヘッダー検証。"""

    def setUp(self):
        self.client = APIClient()

    def test_correct_secret_issues_jwt_for_email_provider(self):
        response = self.client.post(
            PROXY_LOGIN_URL,
            data={"provider": "email", "email": "user@example.com"},
            format="json",
            HTTP_X_INTERNAL_SECRET=TEST_SECRET,
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_missing_secret_is_rejected(self):
        response = self.client.post(
            PROXY_LOGIN_URL,
            data={"provider": "email", "email": "user@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_wrong_secret_is_rejected(self):
        response = self.client.post(
            PROXY_LOGIN_URL,
            data={"provider": "email", "email": "user@example.com"},
            format="json",
            HTTP_X_INTERNAL_SECRET="wrong-secret",
        )
        self.assertEqual(response.status_code, 403)


@override_settings(INTERNAL_API_SECRET=TEST_SECRET, GOOGLE_CLIENT_ID="test-client-id")
class ProxyLoginGoogleEmailVerifiedTests(TestCase):
    """Google id_token の email_verified チェック。"""

    def setUp(self):
        self.client = APIClient()
        self.auth_header = {"HTTP_X_INTERNAL_SECRET": TEST_SECRET}

    @patch("userauth.views.id_token.verify_oauth2_token")
    def test_email_verified_true_succeeds(self, mock_verify):
        mock_verify.return_value = {
            "email": "verified@example.com",
            "name": "Verified User",
            "sub": "google-sub-1",
            "email_verified": True,
        }
        response = self.client.post(
            PROXY_LOGIN_URL,
            data={"provider": "google", "id_token": "dummy"},
            format="json",
            **self.auth_header,
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    @patch("userauth.views.id_token.verify_oauth2_token")
    def test_email_verified_false_is_rejected(self, mock_verify):
        mock_verify.return_value = {
            "email": "unverified@example.com",
            "name": "Unverified User",
            "sub": "google-sub-2",
            "email_verified": False,
        }
        response = self.client.post(
            PROXY_LOGIN_URL,
            data={"provider": "google", "id_token": "dummy"},
            format="json",
            **self.auth_header,
        )
        self.assertEqual(response.status_code, 400)

    @patch("userauth.views.id_token.verify_oauth2_token")
    def test_email_verified_missing_is_rejected(self, mock_verify):
        mock_verify.return_value = {
            "email": "noflag@example.com",
            "name": "No Flag User",
            "sub": "google-sub-3",
        }
        response = self.client.post(
            PROXY_LOGIN_URL,
            data={"provider": "google", "id_token": "dummy"},
            format="json",
            **self.auth_header,
        )
        self.assertEqual(response.status_code, 400)


class CustomUserCreationFormTests(TestCase):
    """/api/signup の一般登録ユーザーが is_staff にならないことを確認。"""

    def test_new_user_is_not_staff(self):
        form = CustomUserCreationForm(data={
            "email": "newuser@example.com",
            "name": "New User",
            "password1": "SuperSecretPass123",
            "password2": "SuperSecretPass123",
        })
        self.assertTrue(form.is_valid(), form.errors)
        user = form.save()
        self.assertFalse(user.is_staff)
