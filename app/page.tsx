"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import MetricsOverview from "@/components/MetricsOverview";
import ChartsSection from "@/components/ChartsSection";
import FilterBar from "@/components/FilterBar";
import JobCard from "@/components/JobCard";
import JobModal from "@/components/JobModal";
import { Job, DashboardMetrics, ApplicationStatus } from "@/lib/types";
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  Globe2, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Send,
  SlidersHorizontal
} from "lucide-react";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total: 0,
    pending: 0,
    applied: 0,
    ignored: 0,
    avgScore: 0,
    uaeCount: 0,
    indiaCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score_desc");

  // Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"email" | "cv" | "cover" | "jd">("email");

  // Live clocks for candidate regions
  const [istTime, setIstTime] = useState("");
  const [gstTime, setGstTime] = useState("");

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setGstTime(now.toLocaleTimeString("en-US", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        setMetrics(data.metrics || {
          total: 0,
          pending: 0,
          applied: 0,
          ignored: 0,
          avgScore: 0,
          uaeCount: 0,
          indiaCount: 0,
        });
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      showToast("Error loading jobs data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    showToast("Dashboard refreshed");
  };

  const handleUpdateStatus = async (jobId: string, newStatus: ApplicationStatus) => {
    // Optimistic update
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, application_status: newStatus } : j))
    );

    // Update metrics optimistically
    setMetrics((prev) => {
      const currentJob = jobs.find((j) => j.id === jobId);
      const oldStatus = currentJob?.application_status || "Shortlisted";
      if (oldStatus === newStatus) return prev;

      let applied = prev.applied;
      let ignored = prev.ignored;
      let pending = prev.pending;

      if (oldStatus === "Applied") applied--;
      else if (oldStatus === "Ignored") ignored--;
      else pending--;

      if (newStatus === "Applied") applied++;
      else if (newStatus === "Ignored") ignored++;
      else pending++;

      return { ...prev, applied, ignored, pending };
    });

    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, application_status: newStatus } : null));
    }

    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(`Failed: ${data.error}`);
        await loadData(); // Revert
      } else {
        showToast(`Marked as ${newStatus}`);
      }
    } catch (err) {
      showToast("Network error updating status");
      await loadData();
    }
  };

  const handleOpenModal = (job: Job, defaultTab: "email" | "cv" | "cover" | "jd" = "email") => {
    setSelectedJob(job);
    setModalTab(defaultTab);
    setIsModalOpen(true);
  };

  // Filter & Sort
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = j.company.toLowerCase().includes(q);
          const matchTitle = j.job_title.toLowerCase().includes(q);
          const matchLocation = j.location.toLowerCase().includes(q);
          const matchSkills = j.matched_technologies?.some((t) => t.toLowerCase().includes(q));
          const matchDesc = j.description?.toLowerCase().includes(q);
          if (!matchCompany && !matchTitle && !matchLocation && !matchSkills && !matchDesc) {
            return false;
          }
        }

        // Status Filter
        if (statusFilter !== "All") {
          if (statusFilter === "Shortlisted") {
            if (j.application_status !== "Shortlisted" && j.application_status !== undefined) return false;
          } else {
            if (j.application_status !== statusFilter) return false;
          }
        }

        // Region Filter
        if (regionFilter !== "All") {
          if (regionFilter === "Dubai") {
            const isDubai = j.country === "AE" || (j.location && j.location.toLowerCase().includes("dubai"));
            if (!isDubai) return false;
          } else if (regionFilter === "Kochi") {
            const isKochi = j.location && j.location.toLowerCase().includes("kochi");
            if (!isKochi) return false;
          } else if (regionFilter === "Remote") {
            const isRemote = j.work_mode === "remote" || (j.location && j.location.toLowerCase().includes("remote"));
            if (!isRemote) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score_desc") {
          return (b.match_score || 0) - (a.match_score || 0);
        } else if (sortBy === "date_desc") {
          return (b.first_discovered_date || "").localeCompare(a.first_discovered_date || "");
        } else if (sortBy === "company_asc") {
          return a.company.localeCompare(b.company);
        }
        return 0;
      });
  }, [jobs, searchQuery, statusFilter, regionFilter, sortBy]);

  return (
    <div className="flex-1 flex flex-col">
      <Navbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600/90 text-white text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-lg border border-indigo-400/30 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Automated 4-Hour Application Pipeline</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Job Navigator & Tailored CV Studio
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Discovering verified React.js & Frontend roles across Dubai & India every 4 hours. 
                Auto-generates 100% ATS-compliant single-column resumes, ready-to-send emails, and structured cover letters.
              </p>
            </div>

            {/* Regional Clocks & Contact Routing Card */}
            <div className="glass-panel p-4 rounded-2xl border-white/10 shrink-0 space-y-3 bg-slate-900/60 min-w-[280px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pb-1 border-b border-white/[0.08]">
                Regional Contact Routing
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <span>🇦🇪 Dubai (GST)</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">{gstTime || "12:00 PM"}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono pl-5">
                Phone: <span className="text-slate-200">+971 556061492</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <span>🇮🇳 Kochi / India (IST)</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">{istTime || "01:30 PM"}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono pl-5">
                Phone: <span className="text-slate-200">+91 8089564801</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Metrics Overview */}
        <MetricsOverview
          metrics={metrics}
          onFilterStatus={(s) => setStatusFilter(s)}
          onFilterRegion={(r) => setRegionFilter(r)}
        />

        {/* 2. Charts & Analytics Section */}
        <ChartsSection jobs={jobs} metrics={metrics} />

        {/* 3. Filter & Search Controls */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalFiltered={filteredJobs.length}
        />

        {/* 4. Job Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Opportunities</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                {filteredJobs.length}
              </span>
            </h2>

            {/* Quick Filter Reset if active */}
            {(searchQuery || statusFilter !== "All" || regionFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setRegionFilter("All");
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300">Loading verified opportunities and tailored assets...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-white">No jobs match your filter criteria</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting the search query, status, or regional selection.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setRegionFilter("All");
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onOpenModal={handleOpenModal}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal for Ready-to-Send Email, ATS CV, Cover Letter, JD */}
      <JobModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Mobile Sticky Navigation */}
      <MobileBottomNav
        onFilterStatus={(s) => {
          if (s === "Dubai") {
            setRegionFilter("Dubai");
            setStatusFilter("All");
          } else {
            setStatusFilter(s);
          }
        }}
        activeStatusFilter={regionFilter === "Dubai" ? "Dubai" : statusFilter}
      />
    </div>
  );
}
