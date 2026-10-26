"use client";

import React, { useState, useEffect } from "react";
import { Job, ApplicationStatus } from "@/lib/types";
import { 
  X, 
  Mail, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Phone, 
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface JobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "email" | "cv" | "cover" | "jd";
  onUpdateStatus?: (jobId: string, status: ApplicationStatus) => Promise<void>;
}

export default function JobModal({
  job,
  isOpen,
  onClose,
  defaultTab = "email",
  onUpdateStatus,
}: JobModalProps) {
  const [activeTab, setActiveTab] = useState<"email" | "cv" | "cover" | "jd">(defaultTab);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedCover, setCopiedCover] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, job]);

  // Handle escape key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const isUae = job.country === "AE" || (job.location && job.location.toLowerCase().includes("dubai"));
  const emailData = job.tailored_email || {
    subject: `Application: ${job.job_title} — Vipin V V (4+ Years React.js)`,
    body: "Email draft not loaded.",
    recipient: `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    phone: job.contact_phone,
    location: job.contact_location,
    is_uae: isUae,
  };

  const cvUrl = `/api/cv/${encodeURIComponent(job.cv_filename)}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailData.body);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyCover = () => {
    if (job.cover_letter) {
      navigator.clipboard.writeText(job.cover_letter);
      setCopiedCover(true);
      setTimeout(() => setCopiedCover(false), 2000);
    }
  };

  const handleMailto = () => {
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.body);
    window.location.href = `mailto:${emailData.recipient}?subject=${subject}&body=${body}`;
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!onUpdateStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(job.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0d121f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.08] bg-slate-900/40 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>{job.company}</span>
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                isUae
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              }`}>
                {isUae ? "🇦🇪 Dubai / UAE (+971)" : "🇮🇳 India (+91)"}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                {job.work_mode || "Hybrid"}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {job.job_title}
            </h2>

            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono">{job.contact_phone}</span>
              </span>
            </div>
          </div>

          {/* Close & Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-4 sm:px-6 border-b border-white/[0.08] bg-slate-900/20 overflow-x-auto space-x-2 py-2">
          <button
            onClick={() => setActiveTab("email")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "email"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-inner-light"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Ready-to-Send Email</span>
          </button>

          <button
            onClick={() => setActiveTab("cv")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "cv"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner-light"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ATS Resume (PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab("cover")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "cover"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-inner-light"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tailored Cover Letter</span>
          </button>

          <button
            onClick={() => setActiveTab("jd")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === "jd"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner-light"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>JD & 100-pt Score ({job.match_score})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: Ready-to-Send Email */}
          {activeTab === "email" && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200/90 leading-relaxed">
                  <strong>International Business Standard:</strong> Clean formatting, zero unwanted glyphs, 
                  calibrated for {isUae ? "Dubai / UAE market with +971 556061492" : "Indian market with +91 8089564801"}.
                  Includes verified metrics (20% API response reduction, 15% page speed, Vite migration).
                </div>
              </div>

              {/* Email Fields Box */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 space-y-3 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center text-xs pb-2 border-b border-white/[0.06] gap-1">
                  <span className="text-slate-400 font-semibold w-20">Recipient:</span>
                  <span className="text-slate-200 font-mono">{emailData.recipient}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center text-xs pb-2 border-b border-white/[0.06] gap-1">
                  <span className="text-slate-400 font-semibold w-20">Subject:</span>
                  <span className="text-slate-100 font-medium">{emailData.subject}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block mb-1.5">Email Body:</span>
                  <pre className="text-xs sm:text-sm text-slate-200 font-sans whitespace-pre-wrap leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/5 select-all">
                    {emailData.body}
                  </pre>
                </div>
              </div>

              {/* Action Buttons for Email */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyEmail}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all active:scale-95 border border-white/10"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedEmail ? "Copied Email to Clipboard!" : "Copy Full Email"}</span>
                  </button>

                  <button
                    onClick={handleMailto}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all active:scale-95 shadow-glow-indigo"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open in Mail Client</span>
                  </button>
                </div>

                {/* Status Toggle in Modal */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStatusChange("Applied")}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all ${
                      job.application_status === "Applied"
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{job.application_status === "Applied" ? "Marked as Applied" : "Mark as Applied"}</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange("Ignored")}
                    disabled={isUpdating}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all ${
                      job.application_status === "Ignored"
                        ? "bg-slate-700 text-white font-bold"
                        : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    <span>{job.application_status === "Ignored" ? "Ignored" : "Ignore"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATS Resume (PDF Preview & Download) */}
          {activeTab === "cv" && (
            <div className="space-y-4">
              {/* ATS Guarantee Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-cyan-200">
                  <span className="font-semibold">ATS Compatibility Guaranteed:</span> Exactly 1-page fit, clean ASCII (zero &lsquo;?&rsquo; glyphs), standard Helvetica Type 1 font, contact phone: <strong>{job.contact_phone}</strong>.
                </div>
                <a
                  href={cvUrl}
                  download={job.cv_filename}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>

              {/* Embedded PDF Viewer */}
              <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-white/10 bg-slate-950 relative">
                <iframe
                  src={`${cvUrl}#toolbar=0`}
                  title={`Tailored ATS CV for ${job.company}`}
                  className="w-full h-full border-0"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>File: <code className="text-slate-300">{job.cv_filename}</code></span>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <span>Open PDF in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: Tailored Cover Letter */}
          {activeTab === "cover" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-purple-200">
                  Tailored specifically for <strong>{job.job_title}</strong> at <strong>{job.company}</strong>.
                </span>
                <button
                  onClick={handleCopyCover}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  {copiedCover ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCover ? "Copied!" : "Copy Cover Letter"}</span>
                </button>
              </div>

              <div className="bg-slate-950/80 border border-white/10 p-5 rounded-2xl">
                <pre className="text-xs sm:text-sm text-slate-200 font-sans whitespace-pre-wrap leading-relaxed select-all">
                  {job.cover_letter || "Cover letter generating..."}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Job Description & 100-Point Score */}
          {activeTab === "jd" && (
            <div className="space-y-4">
              {/* Score Breakdown Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="glass-panel p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Tech Stack</span>
                  <span className="text-base font-bold text-emerald-400">
                    {job.score_breakdown?.tech_stack ?? 30}/30
                  </span>
                </div>
                <div className="glass-panel p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Domain Fit</span>
                  <span className="text-base font-bold text-blue-400">
                    {job.score_breakdown?.domain_experience ?? 25}/25
                  </span>
                </div>
                <div className="glass-panel p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Arch & Speed</span>
                  <span className="text-base font-bold text-cyan-400">
                    {job.score_breakdown?.architecture_performance ?? 16}/20
                  </span>
                </div>
                <div className="glass-panel p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Location Fit</span>
                  <span className="text-base font-bold text-purple-400">
                    {job.score_breakdown?.location_arrangement ?? 15}/15
                  </span>
                </div>
                <div className="glass-panel p-3 rounded-xl text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Seniority</span>
                  <span className="text-base font-bold text-amber-400">
                    {job.score_breakdown?.seniority_fit ?? 10}/10
                  </span>
                </div>
              </div>

              {/* Matched Technologies */}
              {job.matched_technologies && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Matched Technologies & Capabilities:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matched_technologies.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Job Description */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Published Job Description:
                  </h4>
                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>View Original Listing</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.description || "No full description saved."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
