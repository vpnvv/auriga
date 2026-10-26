"use client";

import React, { useState } from "react";
import { Job, ApplicationStatus } from "@/lib/types";
import { 
  Building2, 
  MapPin, 
  ExternalLink, 
  FileText, 
  Mail, 
  Check, 
  EyeOff, 
  Download, 
  Copy, 
  Sparkles,
  Phone,
  Clock,
  RotateCcw
} from "lucide-react";

interface JobCardProps {
  job: Job;
  onOpenModal: (job: Job, defaultTab?: "email" | "cv" | "cover" | "jd") => void;
  onUpdateStatus: (jobId: string, status: ApplicationStatus) => Promise<void>;
}

export default function JobCard({ job, onOpenModal, onUpdateStatus }: JobCardProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isUae = job.country === "AE" || (job.location && job.location.toLowerCase().includes("dubai"));
  const isApplied = job.application_status === "Applied";
  const isIgnored = job.application_status === "Ignored";

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    } else if (score >= 80) {
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
    return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.tailored_email?.body) {
      navigator.clipboard.writeText(job.tailored_email.body);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleStatusChange = async (e: React.MouseEvent, newStatus: ApplicationStatus) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await onUpdateStatus(job.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      onClick={() => onOpenModal(job, "email")}
      className={`glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group cursor-pointer transition-all ${
        isApplied
          ? "border-emerald-500/40 bg-emerald-950/10"
          : isIgnored
          ? "opacity-60 border-slate-700/50 bg-slate-900/30"
          : "border-white/[0.08]"
      }`}
    >
      {/* Top row: Company, Match Score, Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{job.company}</span>
            </span>

            {/* Region badge */}
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center space-x-1 ${
              isUae
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
            }`}>
              <span>{isUae ? "🇦🇪 Dubai, UAE" : "🇮🇳 India"}</span>
            </span>

            {/* Work Mode */}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10 uppercase">
              {job.work_mode || "Hybrid"}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-1">
            {job.job_title}
          </h3>
        </div>

        {/* Fit Score & Status */}
        <div className="flex flex-col items-end shrink-0 space-y-1.5">
          <div className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold border flex items-center space-x-1 shadow-sm ${getScoreBadge(job.match_score)}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{job.match_score}/100</span>
          </div>

          {/* Status Indicator */}
          {isApplied && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Applied</span>
            </span>
          )}
          {isIgnored && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 flex items-center space-x-1">
              <EyeOff className="w-3 h-3" />
              <span>Ignored</span>
            </span>
          )}
          {!isApplied && !isIgnored && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Location, Salary, Phone rule */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mb-3.5">
        <span className="flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{job.location}</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center space-x-1 text-slate-300">
          <Phone className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px]">{job.contact_phone}</span>
        </span>
        {job.salary && (
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium">{job.salary}</span>
          </>
        )}
      </div>

      {/* Skills tags */}
      {job.matched_technologies && job.matched_technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.matched_technologies.slice(0, 4).map((tech, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.06]"
            >
              {tech}
            </span>
          ))}
          {job.matched_technologies.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-white/[0.02] text-slate-500">
              +{job.matched_technologies.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Action Row */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
        {/* Left quick status toggles */}
        <div className="flex items-center space-x-1.5">
          {/* Mark Applied Button */}
          <button
            onClick={(e) => handleStatusChange(e, isApplied ? "Shortlisted" : "Applied")}
            disabled={isUpdating}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all active:scale-95 ${
              isApplied
                ? "bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
            title={isApplied ? "Click to reset to Pending" : "Mark as Applied"}
          >
            {isApplied ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isApplied ? "Reset" : "Mark Applied"}</span>
          </button>

          {/* Mark Ignored Button */}
          <button
            onClick={(e) => handleStatusChange(e, isIgnored ? "Shortlisted" : "Ignored")}
            disabled={isUpdating}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all active:scale-95 ${
              isIgnored
                ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                : "bg-slate-800/40 hover:bg-slate-800/80 text-slate-400 border border-slate-700/50"
            }`}
            title={isIgnored ? "Click to restore" : "Mark as Ignored"}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{isIgnored ? "Unignore" : "Ignore"}</span>
          </button>
        </div>

        {/* Right action assets: View Email / CV Modal + Direct Link */}
        <div className="flex items-center space-x-1.5">
          {/* Copy Email quick button */}
          <button
            onClick={handleCopyEmail}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
            title="Copy Ready-to-Send Email"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* View Details / Modal Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(job, "email");
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-medium flex items-center space-x-1 transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>View Email & CV</span>
          </button>

          {/* Original Link */}
          {job.job_url && (
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
              title="Open Original Job Posting"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
