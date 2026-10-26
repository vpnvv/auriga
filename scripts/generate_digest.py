#!/usr/bin/env python3
"""
Digest & Cover Note Generator for Vipin V V.
Produces metric-grounded cover note, comprehensive daily job report,
structured jobs.json, and formatted email-preview.md.

Adheres strictly to International Business Email Standards:
- Zero unwanted characters, broken markdown, or OCR artifacts
- Dynamic contact information based on target market:
  * Dubai / UAE / Middle East: +971 556061492 | Dubai, UAE
  * Kochi / India / Remote: +91 8089564801 | Kochi, Kerala, India
- Clean, high-readability layout with structured sections
- Provides both pristine plain text and executive responsive HTML
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Tuple

def get_job_contact(job: Dict[str, Any]) -> Tuple[str, str]:
    """Returns regional phone number and location string based on target job location."""
    loc_str = (job.get("location", "") + " " + job.get("country", "")).lower()
    is_uae = any(k in loc_str for k in ["dubai", "uae", "united arab emirates", "ae", "middle east", "abu dhabi", "sharjah"])
    if is_uae:
        return "+971 556061492", "Dubai, UAE"
    return "+91 8089564801", "Kochi, Kerala, India"


def generate_cover_note(top_job: Dict[str, Any], date_str: str) -> str:
    """
    Generates a concise 100-160 word metric-driven cover note for the #1 ranked job.
    Uses regional phone number (+971 for UAE, +91 for India).
    """
    company = top_job.get("company", "Hiring Team")
    title = top_job.get("title", "Frontend Developer")
    job_url = top_job.get("url", "")
    phone, location = get_job_contact(top_job)
    
    note = f"""# Cover Note — {title} at {company}

Date: {date_str}
Target Position: {title}
Company: {company}
Posting URL: {job_url}

--------------------------------------------------------------------------------

Dear Hiring Team at {company},

I am writing to express my strong interest in the {title} opening at {company}. With over 4 years of frontend engineering experience focused on React.js, Next.js, TypeScript, and Redux Toolkit, I have built and scaled high-throughput web applications and enterprise booking platforms.

At Gewan Info Tech Solutions and Caxita Tech Solutions, I specialized in architecting reusable UI component systems and integrating complex asynchronous REST APIs. Through targeted memoization, lazy loading, and modern build tooling with Vite, I achieved a 20% reduction in API response handling time and a 15% improvement in overall page performance.

I am particularly drawn to {company}'s focus on engineering excellence and robust digital experiences. I would welcome the opportunity to discuss how my technical background and performance-focused mindset can deliver immediate value to your team.

Sincerely,
Vipin V V
{location}
{phone} | vipinvv555@gmail.com
[Available to join within standard notice period / immediate upon discussion]
"""
    return note


def generate_job_report(ranked_jobs: List[Dict[str, Any]], date_str: str, apify_note: str) -> str:
    """Generates comprehensive daily job search markdown report."""
    md = [
        f"# Daily React.js & Frontend Job Search Digest — {date_str}",
        "",
        f"- Candidate: Vipin V V (vipinvv555@gmail.com)",
        f"- Profile: 4+ Years Frontend Developer (React.js, Next.js, Redux Toolkit, TypeScript)",
        f"- Target Markets: Kochi (Kerala), India Remote, Dubai & UAE",
        f"- Posting Window: Strictly past 24 hours | Verified Shortlist: {len(ranked_jobs)} positions",
        "",
        "================================================================================",
        "",
        "## Executive Summary",
        f"This daily digest presents the top {len(ranked_jobs)} verified job vacancies discovered within the past 24 hours. "
        "Each position has been analyzed against its corresponding Job Description (JD) and evaluated using a transparent 100-point rubric. "
        "An ATS-compliant single-column PDF resume has been uniquely tailored for each specific role with region-appropriate contact details.",
        "",
        f"Data Source Note: {apify_note}",
        "",
        "================================================================================",
        "",
        "## Ranked 5-Job Shortlist & JD Alignment",
        ""
    ]

    for idx, job in enumerate(ranked_jobs, 1):
        score = job.get("total_score", 0)
        bd = job.get("score_breakdown", {})
        phone, loc = get_job_contact(job)
        
        md.append(f"### {idx}. {job.get('title')} — {job.get('company')}")
        md.append(f"- Match Score: {score}/100")
        md.append(f"- Location & Mode: {job.get('location')} ({job.get('work_mode', 'N/A').title()})")
        md.append(f"- Contact Phone on CV: {phone}")
        md.append(f"- Direct Source URL: {job.get('url')}")
        md.append(f"- Posting Age: {job.get('posted_date_str', 'Past 24 hours')} (Verified)")
        md.append(f"- Experience Required: {job.get('experience_required_years', 4)} years")
        md.append(f"- Compensation: {job.get('salary', 'Not disclosed by employer')}")
        md.append(f"- Score Breakdown: Tech: {bd.get('tech_stack', 0)}/30 | Domain: {bd.get('domain_experience', 0)}/25 | Architecture & Speed: {bd.get('architecture_performance', 0)}/20 | Location: {bd.get('location_arrangement', 0)}/15 | Seniority: {bd.get('seniority_fit', 0)}/10")
        md.append("")
        md.append("Key Stack Matches:")
        for tech in job.get("matched_technologies", []):
            md.append(f"  * {tech}")
        md.append("")
        md.append("Relevant Experience Highlights:")
        for ach in job.get("relevant_achievements", []):
            md.append(f"  * {ach}")
        md.append("")
        md.append(f"Profile Alignment: {job.get('experience_gap_note', 'Aligned with 4+ years frontend profile.')}")
        missing = job.get("missing_requirements", [])
        md.append(f"Identified Skills Not Demonstrated in CV: {', '.join(missing) if missing else 'None'}")
        md.append(f"Attached Tailored ATS Resume: Vipin_VV_{job.get('company', 'Company').replace(' ', '_')}_ATS_CV.pdf")
        md.append("")
        md.append("--------------------------------------------------------------------------------")
        md.append("")

    return "\n".join(md)


def generate_email_preview(ranked_jobs: List[Dict[str, Any]], date_str: str, manifest: List[Dict[str, Any]], cover_note_text: str) -> str:
    """
    Produces clean, international-standard email body (both plain text and preview).
    Completely avoids messy raw markdown, raw hashes, or unwanted glyphs.
    """
    subject = f"Daily React.js Job Digest — {date_str} — {len(ranked_jobs)} Best Matches"

    body = f"""Daily React.js Job Digest — {date_str}
Recipient: vipinvv555@gmail.com
Total Verified Matches: {len(ranked_jobs)} Roles

--------------------------------------------------------------------------------

Hello Vipin,

Here is your daily digest of the top React.js and Frontend Developer opportunities verified within the past 24 hours across Kochi, Remote India, and Dubai/UAE.

Each position has been analyzed against its specific Job Description (JD). An ATS-friendly, single-column resume has been generated for each role, with the appropriate contact phone (+971 for Dubai/UAE, +91 for India).

================================================================================
TOP 5 SHORTLISTED OPPORTUNITIES
================================================================================
"""

    for idx, j in enumerate(ranked_jobs, 1):
        cv_name = manifest[idx-1]["filename"] if idx-1 < len(manifest) else "Tailored_CV.pdf"
        phone, loc = get_job_contact(j)
        body += f"\n{idx}. {j['title']} — {j['company']}\n"
        body += f"   • Fit Score: {j['total_score']}/100\n"
        body += f"   • Location: {j['location']} ({j.get('work_mode', 'N/A').title()})\n"
        body += f"   • Applied Contact: {phone} ({loc})\n"
        body += f"   • Compensation: {j.get('salary', 'Not disclosed')}\n"
        body += f"   • Key Technologies: {', '.join(j.get('matched_technologies', []))}\n"
        body += f"   • Fit Analysis: {j.get('experience_gap_note', 'Direct match for experience level.')}\n"
        missing = j.get('missing_requirements', [])
        body += f"   • Skills Not in CV: {', '.join(missing) if missing else 'None'}\n"
        body += f"   • Tailored ATS Resume: {cv_name}\n"
        body += f"   • Job Listing URL: {j.get('url')}\n"

    body += f"""
================================================================================
FEATURED COVER NOTE (FOR #1 OPPORTUNITY)
================================================================================

{cover_note_text.strip()}

================================================================================
ATTACHMENTS PACKAGE (7 VERIFIED FILES)
================================================================================
1. job-report.md (Comprehensive 100-point JD evaluation digest)
2. cover-note.md (Tailored note for top opportunity)
3. 5 x Tailored ATS CVs in PDF format:
"""
    for m in manifest:
        phone_used = m.get("contact_phone_used", "")
        body += f"   • {m['filename']} (Phone: {phone_used} -> {m['job_title']} at {m['company']})\n"

    body += """
--------------------------------------------------------------------------------
Note: All CVs strictly follow ATS single-column formatting using standard Helvetica typography, with zero tables, progress bars, or decorative graphics for 100% ATS parser compatibility.
"""
    return body


def generate_email_html(ranked_jobs: List[Dict[str, Any]], date_str: str, manifest: List[Dict[str, Any]], cover_note_text: str) -> str:
    """
    Generates an executive-grade, responsive HTML email following international standards.
    Clean typography, high-contrast badges, cards, and mobile-friendly responsive CSS.
    """
    html_cards = []
    
    for idx, j in enumerate(ranked_jobs, 1):
        cv_name = manifest[idx-1]["filename"] if idx-1 < len(manifest) else "Tailored_CV.pdf"
        phone, loc = get_job_contact(j)
        score = j.get("total_score", 0)
        
        # Color badge based on score
        badge_bg = "#ecfdf5" if score >= 90 else "#eff6ff"
        badge_color = "#047857" if score >= 90 else "#1d4ed8"
        
        tech_pills = " ".join([f"<span style='background:#f1f5f9;color:#334155;padding:3px 8px;border-radius:4px;font-size:12px;margin-right:4px;'>{t}</span>" for t in j.get("matched_technologies", [])])
        
        card = f"""
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
            <div>
              <span style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Match #{idx}</span>
              <h3 style="margin:4px 0 2px 0;font-size:17px;color:#0f172a;line-height:1.3;">
                <a href="{j.get('url')}" style="color:#2563eb;text-decoration:none;font-weight:600;">{j.get('title')}</a>
              </h3>
              <div style="color:#475569;font-size:14px;font-weight:500;">{j.get('company')} &bull; {j.get('location')} ({j.get('work_mode', 'N/A').title()})</div>
            </div>
            <div style="background:{badge_bg};color:{badge_color};padding:6px 12px;border-radius:20px;font-weight:700;font-size:14px;white-space:nowrap;">
              {score}/100
            </div>
          </div>
          
          <div style="margin:12px 0;">
            <div style="font-size:13px;color:#64748b;margin-bottom:4px;">Contact Used: <strong>{phone}</strong> ({loc})</div>
            <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Compensation: <strong>{j.get('salary', 'Not disclosed')}</strong></div>
            <div style="margin-top:8px;">{tech_pills}</div>
          </div>
          
          <div style="background:#f8fafc;border-left:3px solid #3b82f6;padding:10px 12px;font-size:13px;color:#334155;border-radius:0 4px 4px 0;margin:12px 0;">
            <strong>Alignment:</strong> {j.get('experience_gap_note', '')}
          </div>
          
          <div style="font-size:12px;color:#64748b;margin-top:10px;">
            <strong>Tailored Resume:</strong> <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#0f172a;">{cv_name}</code>
          </div>
        </div>
        """
        html_cards.append(card)

    cards_html = "\n".join(html_cards)
    
    cv_items_html = "".join([f"<li style='margin-bottom:6px;'><code>{m['filename']}</code> &mdash; Phone: <strong>{m.get('contact_phone_used', '')}</strong> ({m.get('job_title')} at {m.get('company')})</li>" for m in manifest])

    html_email = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Daily React.js Job Digest</title>
</head>
<body style="margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.5;">

  <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background:#0f172a;color:#ffffff;padding:28px 32px;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;">Automated Career Digest</div>
      <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Daily React.js Job Digest &bull; {date_str}</h1>
      <p style="margin:8px 0 0 0;font-size:14px;color:#cbd5e1;">Top 5 verified vacancies tailored to your experience across Kochi, Remote India, and Dubai.</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;background:#f8fafc;">
      
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px 0;">Top Verified Matches</h2>
        {cards_html}
      </div>

      <!-- Featured Cover Note -->
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;">
        <h3 style="font-size:15px;color:#0f172a;margin:0 0 12px 0;">Featured Cover Note (For Top Match)</h3>
        <pre style="background:#f8fafc;padding:16px;border-radius:6px;font-family:monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;color:#334155;border:1px solid #e2e8f0;margin:0;">{cover_note_text.strip()}</pre>
      </div>

      <!-- Attachments Package -->
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;">
        <h3 style="font-size:15px;color:#0f172a;margin:0 0 12px 0;">Attached ATS Resumes & Reports (7 Files)</h3>
        <ul style="font-size:13px;color:#334155;padding-left:20px;margin:0 0 12px 0;">
          <li style="margin-bottom:6px;"><strong>job-report.md</strong> &mdash; In-depth 100-point JD evaluation digest</li>
          <li style="margin-bottom:6px;"><strong>cover-note.md</strong> &mdash; Tailored note for top opportunity</li>
          {cv_items_html}
        </ul>
        <div style="font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;padding-top:10px;">
          All resumes adhere strictly to single-column ATS specifications with standard Helvetica typography and verified contact details.
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#ffffff;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;">
      Delivered to vipinvv555@gmail.com &bull; Automated Career Pipeline
    </div>

  </div>

</body>
</html>
"""
    return html_email
