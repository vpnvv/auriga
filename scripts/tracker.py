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

    def record_job(self, job: Dict[str, Any], date_str: str, cv_filename: str):
        sig = f"{job.get('company', '').lower()}:::{job.get('title', '').lower()}"
        
        if sig in self.jobs:
            # Update last seen / repost date
            self.jobs[sig]["last_seen_date"] = date_str
            self.jobs[sig]["match_score"] = job.get("total_score", self.jobs[sig].get("match_score", 0))
            return False # Already existed
        
        entry = {
            "id": job.get("id"),
            "company": job.get("company"),
            "job_title": job.get("title"),
            "location": job.get("location"),
            "work_mode": job.get("work_mode"),
            "job_url": job.get("url"),
            "posting_date": job.get("posted_date_str", "Past 24h"),
            "first_discovered_date": date_str,
            "last_seen_date": date_str,
            "match_score": job.get("total_score", 0),
            "cv_filename": cv_filename,
            "application_status": "Shortlisted", # Never auto-mark as applied
            "follow_up_date": "Pending manual review",
            "notes": job.get("experience_gap_note", "")
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
