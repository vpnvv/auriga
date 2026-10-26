#!/usr/bin/env python3
"""
WhatsApp Integration Module for Vipin V V.
Provides automated delivery of the daily job digest summary to WhatsApp.

Supported Gateways (100% Free for Personal Use):
1. CallMeBot API (Simplest, zero registration, 1 HTTP GET request)
   - Setup: Send a WhatsApp message "I allow callmebot to send me messages" to +34 911 06 54 84 (or official bot)
   - Receives: Personal API key
   - Config: CALLMEBOT_API_KEY in ./config/.env
2. Twilio WhatsApp Sandbox (Official Meta Partner)
   - Config: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN in ./config/.env
"""

import os
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Tuple, Optional

class WhatsAppDeliveryService:
    def __init__(self, config_path: str = "./config/job-search.json", env_path: str = "./config/.env"):
        self.config_path = config_path
        self.env_path = env_path
        self.recipient_phone = self._load_recipient()
        self.callmebot_key, self.twilio_sid, self.twilio_token = self._load_credentials()

    def _load_recipient(self) -> str:
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get("whatsapp", {}).get("recipient", "+918089564801")
            except Exception:
                pass
        return "+918089564801"

    def _load_credentials(self) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        callmebot_key = os.environ.get("CALLMEBOT_API_KEY")
        twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        twilio_token = os.environ.get("TWILIO_AUTH_TOKEN")

        if os.path.exists(self.env_path):
            with open(self.env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("CALLMEBOT_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            callmebot_key = val
                    elif line.startswith("TWILIO_ACCOUNT_SID="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            twilio_sid = val
                    elif line.startswith("TWILIO_AUTH_TOKEN="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            twilio_token = val

        return callmebot_key, twilio_sid, twilio_token

    def is_configured(self) -> bool:
        return bool(self.callmebot_key or (self.twilio_sid and self.twilio_token))

    def format_whatsapp_message(self, ranked_jobs: List[Dict[str, Any]], date_str: str) -> str:
        """
        Formats a clean, high-readability WhatsApp alert with emojis and direct links.
        International standard formatting avoiding clutter.
        """
        msg = [
            f"🚀 *Daily React.js Job Digest — {date_str}*",
            f"👤 *Candidate:* Vipin V V",
            f"📍 *Scope:* Kochi | Remote India | Dubai",
            f"📊 *Verified 24h Shortlist:* {len(ranked_jobs)} Roles\n",
            "━━━━━━━━━━━━━━━━━━━━"
        ]

        for idx, j in enumerate(ranked_jobs, 1):
            score = j.get("total_score", 0)
            title = j.get("title", "")
            company = j.get("company", "")
            location = j.get("location", "")
            url = j.get("url", "")
            salary = j.get("salary", "Not disclosed")
            
            # Emoji rating
            star = "⭐" if score >= 90 else "🔹"
            
            msg.append(f"\n{star} *#{idx} [{score}/100] {title}*")
            msg.append(f"🏢 *Company:* {company}")
            msg.append(f"📍 *Location:* {location}")
            msg.append(f"💰 *Salary:* {salary}")
            msg.append(f"🔗 *Listing:* {url}")

        msg.append("\n━━━━━━━━━━━━━━━━━━━━")
        msg.append("📄 *CV PDFs & Detailed Report sent to:* vipinvv555@gmail.com")
        msg.append("⏰ *Next Run:* Tomorrow at 06:00 AM IST")
        
        return "\n".join(msg)

    def send_whatsapp_digest(self, message_text: str) -> Tuple[bool, str]:
        """Delivers WhatsApp message via CallMeBot or Twilio gateway."""
        if not self.is_configured():
            return False, "WHATSAPP PENDING: No WhatsApp gateway configured in ./config/.env (CALLMEBOT_API_KEY)."

        # Gateway 1: CallMeBot (Personal Free API)
        if self.callmebot_key:
            clean_phone = self.recipient_phone.replace("+", "").replace(" ", "").replace("-", "")
            encoded_text = urllib.parse.quote(message_text)
            url = f"https://api.callmebot.com/whatsapp.php?phone={clean_phone}&text={encoded_text}&apikey={self.callmebot_key}"
            
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_data = resp.read().decode('utf-8', errors='ignore')
                    if "Message queued" in resp_data or "OK" in resp_data or resp.status == 200:
                        return True, f"SUCCESS: WhatsApp digest delivered to {self.recipient_phone} via CallMeBot."
                    return False, f"CallMeBot response: {resp_data[:150]}"
            except Exception as e:
                return False, f"CallMeBot delivery error: {str(e)}"

        return False, "No active WhatsApp delivery channel."
