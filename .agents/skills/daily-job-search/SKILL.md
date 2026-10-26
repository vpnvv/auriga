---
name: daily-job-search
description: "Auriga: Automated daily job search, ATS resume tailoring, daily markdown digests, and email reporting for Vipin V V (React.js / Frontend Developer)."
metadata:
  version: "1.0.0"
  author: "Vipin V V"
  project: "Auriga"
  tags: [job-search, auriga, react, automation, ats-resume, apify, email-digest]
---

# Auriga — Daily Career Automation Workflow

**Auriga** orchestrates the end-to-end daily job search pipeline for **Vipin V V**, matching verified 24-hour job openings across Kochi, India Remote, and Dubai/UAE, tailoring single-column ATS resumes from the source CV, preparing targeted cover notes, updating the persistent application tracker, and packaging email digests.

## 1. Candidate Source of Truth
- **Name**: Vipin V V
- **Email**: `vipinvv555@gmail.com`
- **Phone**: `+91 8089564801`
- **Source CV**: `./Vipin_V_V_FrontEnd_Developer_CV.pdf`
- **Primary Roles**: React.js Developer, Frontend Developer, Frontend Engineer, Software Developer (React / Next.js)
- **Experience Level**: 4+ years frontend development
- **Current Role**: Software Developer at Gewan Info Tech Solutions India Pvt Ltd (Aug 2025–Present)
- **Previous Role**: React.js Developer at Caxita Tech Solutions Pvt Ltd (Mar 2022–Jun 2025)
- **Verified Metrics**: 20% faster API response handling, 15% improved page load performance, Webpack to Vite migration.

---

## 2. Execution Pipeline Overview

Every daily run (scheduled at 06:00 Asia/Kolkata or executed manually) follows these sequential steps:

```
[1. Ingest Configuration & Secrets]
                 ↓
[2. Collect Listings (Apify LinkedIn & Indeed)]
                 ↓
[3. Mandatory 5-Point Filtering (24h, Geography, Role)]
                 ↓
[4. 100-Point Transparent Scoring & Selection (Top 5)]
                 ↓
[5. Generate Tailored ATS PDFs & Verify Text]
                 ↓
[6. Produce High-Impact Cover Note & Markdown Digest]
                 ↓
[7. Update Persistent Application Tracker]
                 ↓
[8. Package Email Digest & Local Archive]
```

---

## 3. Step-by-Step Workflow Instructions

### Step 1: Ingest Configuration
- Read `./config/job-search.json`.
- Load secrets from environment variables or `./config/.env` (`APIFY_TOKEN`, `GMAIL_APP_PASSWORD`).
- Verify existence and integrity of source CV at `./Vipin_V_V_FrontEnd_Developer_CV.pdf`.

### Step 2: Ingest Job Data via Apify
- Trigger Apify actors:
  - **LinkedIn**: `valig/linkedin-jobs-scraper` or `curious_coder/linkedin-jobs-scraper`
  - **Indeed**: `orgupdate/indeed-jobs-scraper`
- Pass search queries for target titles (`React.js Developer`, `Frontend Developer`, `Next.js Developer`) across target regions (`Kochi, Kerala`, `India Remote`, `Dubai, UAE`).
- Cap items at 30–50 per source to maintain cost efficiency (<$0.50 per run).
- If API token is missing, execute local live web search collector for non-blocking execution.

### Step 3: Mandatory Gate Filtering & Date Verification
- Reference: [job-matching-rules.md](./references/job-matching-rules.md)
- Ensure every listing passes:
  1. Relevant role alignment.
  2. Eligible location & work arrangement.
  3. Verifiable posting within the last 24 hours. (If age cannot be confirmed, mark "Posting date unverified" and exclude from top-5 shortlist).
  4. Working direct source URL.
  5. Deduplication against already discovered jobs.

### Step 4: 100-Point Transparent Scoring
- Calculate fit score:
  - Technical Stack Match: **30 pts**
  - Domain & Experience Match: **25 pts**
  - Architecture & Performance Depth: **20 pts**
  - Location & Work Arrangement: **15 pts**
  - Seniority Fit: **10 pts**
- Rank results in descending order. Select the **top 5 verified jobs** (or fewer if fewer qualify).

### Step 5: ATS Resume Tailoring & Validation
- Reference: [resume-tailoring-rules.md](./references/resume-tailoring-rules.md)
- For each selected job, generate a tailored single-column ATS PDF:
  - Adjust professional summary and keyword ordering to emphasize the target JD.
  - Strictly maintain factual accuracy—do NOT fabricate experience, metrics, or technologies.
  - File name pattern: `Vipin_VV_<Company>_<Role>_ATS_CV.pdf` in `./job-search-output/YYYY-MM-DD/cvs/`.
- Programmatically extract and verify the text of every generated PDF. Confirm contact info, dates, and metrics match the source CV.
- Write `./job-search-output/YYYY-MM-DD/cvs/manifest.json`.

### Step 6: Cover Note & Daily Digest Generation
- For the #1 ranked job, author a 100–160 word metric-driven cover note emphasizing travel tech/booking engine architecture, API optimization (20%), and page load speedups (15%). Save to `./job-search-output/YYYY-MM-DD/cover-note.md`.
- Generate `./job-search-output/YYYY-MM-DD/job-report.md` detailing all 5 matches with match scores, pros, missing skills ("Not demonstrated in the CV"), and direct URLs.
- Save structured data to `./job-search-output/YYYY-MM-DD/jobs.json`.

### Step 7: Application Tracker Update
- Maintain persistent tracker in `./tracker/job_tracker.json` and human-readable `./tracker/tracker.md`.
- Record job URL, company, title, location, discovery date, match score, CV filename, application status (`Shortlisted`), and follow-up notes.
- Do NOT mark applications as submitted.

### Step 8: Email Preview & Dispatch
- Reference: [integrations.md](./references/integrations.md)
- Generate `./job-search-output/YYYY-MM-DD/email-preview.md`.
- Subject: `Daily React.js Job Digest — YYYY-MM-DD — 5 Best Matches`
- Initial test requires explicit user approval before network dispatch.
- Attachments: `job-report.md`, `cover-note.md`, and the 5 tailored ATS PDFs.

---

## 4. Safety & Operating Constraints
- **Zero Hallucination**: Never invent company listings, dates, skills, or email delivery confirmations.
- **No Secret Leaks**: Never print API tokens or passwords in chat, logs, or output files.
- **Never Submit Applications**: This workflow only discovers, ranks, tailors resumes, and reports to Vipin. It never applies autonomously or contacts recruiters.
- **Dry-Run by Default**: Email notifications start in preview/dry-run mode until approved.

---

## 5. Manual Execution & CLI Commands
Run commands from the project root:
```bash
# 1. Full daily pipeline run (Search, Rank, Tailor PDFs, Digest, Tracker, Email Preview)
python3 scripts/run_daily_search.py --mode=full

# 2. Test Apify connectivity only
python3 scripts/run_daily_search.py --mode=test-apify

# 3. Test ATS PDF generator & text extraction
python3 scripts/run_daily_search.py --mode=test-pdf

# 4. Preview email digest without sending
python3 scripts/run_daily_search.py --mode=preview

# 5. Check tracker status
python3 scripts/run_daily_search.py --mode=status
```
