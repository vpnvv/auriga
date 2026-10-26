import { Job, DashboardMetrics } from "./types";
import jobsData from "../public/data/jobs.json";

export const INITIAL_JOBS: Job[] = Object.values(jobsData as unknown as Record<string, Job>).sort(
  (a, b) => (b.match_score || 0) - (a.match_score || 0)
);

export function calculateMetrics(jobs: Job[]): DashboardMetrics {
  const total = jobs.length;
  const applied = jobs.filter((j) => j.application_status === "Applied").length;
  const ignored = jobs.filter((j) => j.application_status === "Ignored").length;
  const pending = jobs.filter(
    (j) => j.application_status === "Shortlisted" || !j.application_status
  ).length;

  const totalScore = jobs.reduce((acc, curr) => acc + (curr.match_score || 0), 0);
  const avgScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

  const uaeCount = jobs.filter(
    (j) =>
      j.country === "AE" ||
      (j.location && j.location.toLowerCase().includes("dubai"))
  ).length;

  const indiaCount = jobs.filter(
    (j) =>
      j.country === "IN" ||
      (j.location &&
        (j.location.toLowerCase().includes("kochi") ||
          j.location.toLowerCase().includes("india")))
  ).length;

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
