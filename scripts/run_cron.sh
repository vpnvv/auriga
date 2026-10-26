#!/bin/bash
# ==============================================================================
# Auriga Daily Job Search Automated Runner (launchd & cron compatible)
# ==============================================================================

PROJECT_DIR="/Users/vipinvv/.gemini/antigravity/scratch/vipin-job-search-automation"
cd "$PROJECT_DIR" || exit 1

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Run full pipeline and deliver email to vipinvv555@gmail.com
/usr/bin/python3 "$PROJECT_DIR/scripts/run_daily_search.py" --mode=send-approved >> "$PROJECT_DIR/job-search-output/automation.log" 2>&1
