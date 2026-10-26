import fs from "fs";
import path from "path";
import { Job, DashboardMetrics, ApplicationStatus } from "./types";

const TRACKER_PATH = path.join(process.cwd(), "tracker", "job_tracker.json");
const TRACKER_MD_PATH = path.join(process.cwd(), "tracker", "tracker.md");
const OUTPUT_DIR = path.join(process.cwd(), "job-search-output");

export function getJobs(): Job[] {
  if (!fs.existsSync(TRACKER_PATH)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(TRACKER_PATH, "utf-8");
    const data = JSON.parse(raw);
    const jobs: Job[] = Object.values(data);

    // Sort by match_score descending, then first_discovered_date descending
    return jobs.sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score;
      }
      return (b.first_discovered_date || "").localeCompare(a.first_discovered_date || "");
    });
  } catch (error) {
    console.error("Failed to read job tracker:", error);
    return [];
  }
}

export function getMetrics(jobs: Job[]): DashboardMetrics {
  const total = jobs.length;
  const applied = jobs.filter(j => j.application_status === "Applied").length;
  const ignored = jobs.filter(j => j.application_status === "Ignored").length;
  const pending = jobs.filter(j => j.application_status === "Shortlisted" || !j.application_status).length;
  
  const totalScore = jobs.reduce((acc, curr) => acc + (curr.match_score || 0), 0);
  const avgScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

  const uaeCount = jobs.filter(j => j.country === "AE" || (j.location && j.location.toLowerCase().includes("dubai"))).length;
  const indiaCount = jobs.filter(j => j.country === "IN" || (j.location && (j.location.toLowerCase().includes("kochi") || j.location.toLowerCase().includes("india")))).length;

  return {
    total,
    pending,
    applied,
    ignored,
    avgScore,
    uaeCount,
    indiaCount,
  };
}

export function updateJobStatus(id: string, newStatus: ApplicationStatus, notes?: string): boolean {
  if (!fs.existsSync(TRACKER_PATH)) return false;

  try {
    const raw = fs.readFileSync(TRACKER_PATH, "utf-8");
    const data: Record<string, Job> = JSON.parse(raw);

    let foundKey: string | null = null;
    for (const [key, job] of Object.entries(data)) {
      if (job.id === id || key.toLowerCase() === id.toLowerCase()) {
        foundKey = key;
        break;
      }
    }

    if (!foundKey) return false;

    data[foundKey].application_status = newStatus;
    if (newStatus === "Applied") {
      data[foundKey].applied_at = new Date().toISOString();
      data[foundKey].ignored_at = null;
    } else if (newStatus === "Ignored") {
      data[foundKey].ignored_at = new Date().toISOString();
    } else if (newStatus === "Shortlisted") {
      data[foundKey].applied_at = null;
      data[foundKey].ignored_at = null;
    }

    if (notes !== undefined) {
      data[foundKey].notes = notes;
    }

    // Save JSON
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(data, null, 2), "utf-8");

    // Sync markdown table
    syncMarkdownTracker(Object.values(data));

    return true;
  } catch (err) {
    console.error("Failed to update job status:", err);
    return false;
  }
}

function syncMarkdownTracker(jobs: Job[]) {
  const sorted = [...jobs].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  const lines = [
    "# Auriga — Persistent Career Application Tracker — Vipin V V",
    "",
    `> **Last Synced**: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} (Asia/Kolkata)  `,
    `> **Total Tracked Opportunities**: ${jobs.length}  `,
    "> **Status Options**: `Shortlisted` (Pending), `Applied`, `Ignored`.",
    "",
    "| # | Company | Job Title | Location | Score | Discovered | Status | CV File | Direct Link |",
    "| :-: | :--- | :--- | :--- | :-: | :-: | :-: | :--- | :--- |",
  ];

  sorted.forEach((j, idx) => {
    lines.push(
      `| ${idx + 1} | **${j.company}** | ${j.job_title} | ${j.location} | ` +
      `**${j.match_score}/100** | ${j.first_discovered_date || "Today"} | ` +
      `\`${j.application_status}\` | \`${j.cv_filename || "N/A"}\` | [Open Listing](${j.job_url}) |`
    );
  });

  fs.writeFileSync(TRACKER_MD_PATH, lines.join("\n") + "\n", "utf-8");
}

export function findCvFile(filename: string): string | null {
  // Search recursively in job-search-output
  if (!fs.existsSync(OUTPUT_DIR)) return null;

  const dates = fs.readdirSync(OUTPUT_DIR).filter(f => fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory());
  for (const d of dates) {
    const cvCandidate = path.join(OUTPUT_DIR, d, "cvs", filename);
    if (fs.existsSync(cvCandidate)) {
      return cvCandidate;
    }
  }

  // Also check if filename matches without path
  return null;
}
