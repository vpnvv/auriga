export type ApplicationStatus = "Shortlisted" | "Applied" | "Ignored";

export interface TailoredEmail {
  subject: string;
  body: string;
  recipient: string;
  phone: string;
  location: string;
  is_uae: boolean;
}

export interface ScoreBreakdown {
  tech_stack?: number;
  domain_experience?: number;
  architecture_performance?: number;
  location_arrangement?: number;
  seniority_fit?: number;
}

export interface Job {
  id: string;
  company: string;
  job_title: string;
  location: string;
  work_mode: string;
  country: "AE" | "IN" | "Remote";
  contact_phone: string;
  contact_location: string;
  salary: string;
  job_url: string;
  posting_date: string;
  first_discovered_date: string;
  last_seen_date: string;
  match_score: number;
  score_breakdown: ScoreBreakdown;
  matched_technologies: string[];
  cv_filename: string;
  application_status: ApplicationStatus;
  applied_at: string | null;
  ignored_at: string | null;
  follow_up_date: string;
  notes: string;
  description: string;
  tailored_email: TailoredEmail;
  cover_letter: string;
}

export interface DashboardMetrics {
  total: number;
  pending: number;
  applied: number;
  ignored: number;
  avgScore: number;
  uaeCount: number;
  indiaCount: number;
}

export interface GitHubWorkflowRun {
  databaseId: number;
  workflowName: string;
  displayTitle: string;
  status: string;
  conclusion: string | null;
  event: string;
  headBranch: string;
  headSha: string;
  createdAt: string;
  updatedAt: string;
}
