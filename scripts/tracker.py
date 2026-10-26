#!/usr/bin/env python3
"""
Persistent Application Tracker for Vipin V V.
Tracks discovered opportunities across runs, prevents duplicate spam,
and records application lifecycle status.
Never marks jobs as applied automatically.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List

TRACKER_JSON = "./tracker/job_tracker.json"
TRACKER_MD = "./tracker/tracker.md"

class JobTracker:
    def __init__(self, json_path: str = TRACKER_JSON, md_path: str = TRACKER_MD):
        self.json_path = json_path
        self.md_path = md_path
        self.jobs: Dict[str, Dict[str, Any]] = self._load()

    def _load(self) -> Dict[str, Dict[str, Any]]:
        if os.path.exists(self.json_path):
            try:
                with open(self.json_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def save(self):
        os.makedirs(os.path.dirname(self.json_path), exist_ok=True)
        with open(self.json_path, 'w', encoding='utf-8') as f:
            json.dump(self.jobs, f, indent=2)
        self._write_markdown()

    def is_already_tracked(self, company: str, title: str) -> bool:
        sig = f"{company.lower()}:::{title.lower()}"
        return sig in self.jobs

    def update_status(self, job_id: str, new_status: str, notes: str = None) -> bool:
        """Updates status of a job (e.g., Shortlisted, Applied, Ignored)."""
        for sig, entry in self.jobs.items():
            if entry.get("id") == job_id or sig == job_id.lower():
                entry["application_status"] = new_status
                if new_status.lower() == "applied":
                    entry["applied_at"] = datetime.now().isoformat()
                elif new_status.lower() == "ignored":
                    entry["ignored_at"] = datetime.now().isoformat()
                if notes:
                    entry["notes"] = notes
                self.save()
                return True
        return False

    def record_job(self, job: Dict[str, Any], date_str: str, cv_filename: str):
        sig = f"{job.get('company', '').lower()}:::{job.get('title', '').lower()}"
        
        # Determine regional contact and email
        loc_str = (job.get("location", "") + " " + job.get("country", "")).lower()
        is_uae = any(k in loc_str for k in ["dubai", "uae", "united arab emirates", "ae", "middle east", "abu dhabi", "sharjah"])
        phone = "+971 556061492" if is_uae else "+91 8089564801"
        contact_loc = "Dubai, UAE" if is_uae else "Kochi, Kerala, India"

        if sig in self.jobs:
            # Update last seen / repost date
            self.jobs[sig]["last_seen_date"] = date_str
            self.jobs[sig]["match_score"] = job.get("total_score", self.jobs[sig].get("match_score", 0))
            if cv_filename and cv_filename != "N/A":
                self.jobs[sig]["cv_filename"] = cv_filename
            return False # Already existed
        
        entry = {
            "id": job.get("id"),
            "company": job.get("company"),
            "job_title": job.get("title"),
            "location": job.get("location"),
            "work_mode": job.get("work_mode", "hybrid"),
            "country": "AE" if is_uae else "IN",
            "contact_phone": phone,
            "contact_location": contact_loc,
            "salary": job.get("salary", "Market Competitive"),
            "job_url": job.get("url"),
            "posting_date": job.get("posted_date_str", "Past 24h"),
            "first_discovered_date": date_str,
            "last_seen_date": date_str,
            "match_score": job.get("total_score", 0),
            "score_breakdown": job.get("score_breakdown", {}),
            "matched_technologies": job.get("matched_technologies", []),
            "cv_filename": cv_filename,
            "application_status": "Shortlisted", # Shortlisted / Pending review
            "applied_at": None,
            "ignored_at": None,
            "follow_up_date": "Pending manual review",
            "notes": job.get("experience_gap_note", ""),
            "description": job.get("description", "")
        }
        self.jobs[sig] = entry
        return True # Newly recorded

    def _write_markdown(self):
        md = [
            "# Auriga — Persistent Career Application Tracker — Vipin V V",
            "",
            f"> **Last Synced**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ",
            f"> **Total Tracked Opportunities**: {len(self.jobs)}  ",
            "> **Rule**: Applications are tracked as `Shortlisted` by default. Manual action is required to apply.",
            "",
            "| # | Company | Job Title | Location | Score | First Discovered | Status | CV File | Direct Link |",
            "| :-: | :--- | :--- | :--- | :-: | :-: | :-: | :--- | :--- |"
        ]

        # Sort by first_discovered_date descending, then match_score descending
        sorted_jobs = sorted(self.jobs.values(), key=lambda x: (x.get("first_discovered_date", ""), x.get("match_score", 0)), reverse=True)

        for idx, j in enumerate(sorted_jobs, 1):
            md.append(
                f"| {idx} | **{j.get('company')}** | {j.get('job_title')} | {j.get('location')} | "
                f"**{j.get('match_score')}/100** | {j.get('first_discovered_date')} | "
                f"`{j.get('application_status')}` | `{j.get('cv_filename')}` | [Open Listing]({j.get('job_url')}) |"
            )

        with open(self.md_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(md) + "\n")
