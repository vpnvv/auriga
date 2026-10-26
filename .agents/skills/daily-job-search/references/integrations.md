# Integration Architecture: Apify, Gmail, and Scheduler

## 1. Apify Job Scraping Integration
- **Portal**: [https://console.apify.com/](https://console.apify.com/)
- **Authentication**: Set via `APIFY_TOKEN` in `./config/.env` or shell environment.
- **Actor 1: LinkedIn Jobs Scraper** (`valig/linkedin-jobs-scraper` or `curious_coder/linkedin-jobs-scraper`)
  - **Inputs**:
    ```json
    {
      "keywords": "React.js Developer OR Frontend Developer",
      "location": "Kochi, Kerala, India",
      "datePosted": "past-24h",
      "maxItems": 30
    }
    ```
  - **Output Parsing**: Extract `title`, `companyName`, `location`, `link`, `postedDate`, `descriptionText`.
  - **Date Verification**: Validate `postedDate` corresponds to the last 24 hours. Crawl timestamps are disregarded.
- **Actor 2: Indeed Jobs Scraper** (`orgupdate/indeed-jobs-scraper`)
  - **Inputs**:
    ```json
    {
      "position": "Frontend Developer",
      "location": "Dubai",
      "country": "AE",
      "fromDays": 1,
      "maxItems": 30
    }
    ```
  - **Output Parsing**: Extract `title`, `company`, `location`, `url`, `date`, `description`, `salary`.
- **Cost & Rate Control**:
  - Run cost limit: Max $0.50 per daily execution.
  - Item ceiling: 25–50 items per source.
  - Fail-soft handling: If LinkedIn fails but Indeed succeeds (or vice versa), log the warning and process available listings without aborting the pipeline.

---

## 2. Gmail Integration & Safety Protocols
- **Recipient**: `vipinvv555@gmail.com`
- **Supported Connection Modes**:
  1. **Google App Password (Recommended)**:
     - Generate a 16-character App Password at [Google Account Security](https://myaccount.google.com/apppasswords).
     - Save as `GMAIL_APP_PASSWORD` in `./config/.env`.
     - Delivered via secure SMTP SSL (`smtp.gmail.com:465`).
  2. **Gmail REST API (OAuth 2.0)**:
     - Standard `credentials.json` with `https://www.googleapis.com/auth/gmail.send` scope.
  3. **Local Dry-Run Draft Mode**:
     - When credentials are not yet supplied, generate `./job-search-output/YYYY-MM-DD/email-preview.md`.
- **Delivery Safety Policy**:
  - **Gated Approval**: Never send an email automatically on initial setup without the candidate's explicit approval.
  - **Dry-Run Inspection**: Always verify subject, recipients, HTML body, and attachment paths prior to network transmission.
  - **Attachment Management**: If attachments exceed 25MB, attach only `job-report.md` and link the local CV directory.

---

## 3. Persistent Scheduling (Asia/Kolkata 06:00)
- **Native Antigravity Sidecar Automation**:
  - Config Path: `~/.gemini/jetski/sidecars/daily-job-search/sidecar.json`
  - Cron: `CRON_TZ=Asia/Kolkata 0 6 * * *`
  - Executed command: `agentapi new-conversation -- Execute Vipin's daily job search automation workflow`
  - Dashboard: `[Open Automations Dashboard](sidecar://dashboard)`
- **CLI Runner**:
  - `python3 scripts/run_daily_search.py --mode=full`
  - `python3 scripts/run_daily_search.py --mode=preview`
  - `python3 scripts/run_daily_search.py --mode=test-pdf`
