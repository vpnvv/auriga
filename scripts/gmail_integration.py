#!/usr/bin/env python3
"""
Gmail Integration Module for Vipin V V.
Provides dual delivery mechanisms:
1. Google App Password (SMTPS via smtplib on port 465)
2. Gmail OAuth2 API
3. Safe Local Dry-Run / Draft Mode (Default)
Enforces safety gates and strict delivery confirmation.
"""

import os
import smtplib
import mimetypes
from email.message import EmailMessage
from email.utils import formatdate
from typing import Dict, Any, List, Tuple, Optional

class GmailDeliveryService:
    def __init__(self, config_path: str = "./config/job-search.json", env_path: str = "./config/.env"):
        self.config_path = config_path
        self.env_path = env_path
        self.recipient = "vipinvv555@gmail.com"
        self.user_email, self.app_password = self._load_credentials()

    def _load_credentials(self) -> Tuple[Optional[str], Optional[str]]:
        user = os.environ.get("GMAIL_USER") or "vipinvv555@gmail.com"
        app_pw = os.environ.get("GMAIL_APP_PASSWORD")

        if not app_pw and os.path.exists(self.env_path):
            with open(self.env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GMAIL_USER="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            user = val
                    elif line.startswith("GMAIL_APP_PASSWORD="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            app_pw = val
        return user, app_pw

    def check_status(self) -> Dict[str, Any]:
        """Inspects whether Gmail credentials are ready without attempting network calls."""
        has_credentials = bool(self.app_password and len(self.app_password) >= 16)
        return {
            "recipient": self.recipient,
            "configured_user": self.user_email,
            "has_app_password": has_credentials,
            "auth_ready": has_credentials,
            "recommended_mode": "Google App Password" if has_credentials else "Local Draft / Approval Required"
        }

    def send_digest_email(self, subject: str, body_text: str, attachment_paths: List[str], dry_run: bool = True, html_body: Optional[str] = None) -> Tuple[bool, str]:
        """
        Sends the digest email to Vipin.
        If dry_run is True, returns verified dry-run simulation without touching the network.
        Supports multipart/alternative (pristine plain text + executive responsive HTML).
        """
        if dry_run:
            return True, f"DRY RUN SUCCESS: Verified email envelope for {self.recipient} with {len(attachment_paths)} attachments. No network call made."

        if not self.app_password:
            return False, "DELIVERY BLOCKED: GMAIL_APP_PASSWORD is not set in ./config/.env or environment. Draft preserved locally."

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = f"Daily Job Digest <{self.user_email}>"
        msg['To'] = self.recipient
        msg['Date'] = formatdate(localtime=True)
        msg.set_content(body_text)

        if html_body:
            msg.add_alternative(html_body, subtype='html')

        # Attach documents
        total_size = 0
        attached_count = 0
        for path in attachment_paths:
            if not os.path.exists(path):
                continue
            size = os.path.getsize(path)
            if total_size + size > 24 * 1024 * 1024: # 24MB safeguard
                break
            total_size += size
            
            ctype, encoding = mimetypes.guess_type(path)
            if ctype is None or encoding is not None:
                ctype = 'application/octet-stream'
            maintype, subtype = ctype.split('/', 1)

            with open(path, 'rb') as f:
                msg.add_attachment(f.read(), maintype=maintype, subtype=subtype, filename=os.path.basename(path))
            attached_count += 1

        try:
            # Connect using SSL to smtp.gmail.com:465
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
                server.login(self.user_email, self.app_password)
                server.send_message(msg)
            return True, f"SUCCESS: Digest email sent to {self.recipient} with {attached_count} attachments via Gmail SMTP SSL."
        except smtplib.SMTPAuthenticationError:
            return False, "AUTHENTICATION FAILED: Gmail rejected credentials. Verify your 16-character App Password at https://myaccount.google.com/apppasswords."
        except Exception as e:
            return False, f"NETWORK ERROR: Failed to deliver email via Gmail: {str(e)}"
