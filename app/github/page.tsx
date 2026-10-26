"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { GitHubWorkflowRun } from "@/lib/types";
import { 
  Github, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitBranch, 
  GitCommit, 
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function GitHubStatusPage() {
  const [runs, setRuns] = useState<GitHubWorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  const fetchRuns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/github");
      const data = await res.json();
      if (data.runs) {
        setRuns(data.runs);
      }
    } catch (err) {
      console.error("Failed to fetch runs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleTriggerRun = async () => {
    setIsTriggering(true);
    setTriggerMessage("Triggering GitHub Actions cloud runner...");
    try {
      const res = await fetch("/api/github/trigger", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTriggerMessage("Run dispatched successfully to GitHub Actions!");
        setTimeout(() => {
          fetchRuns();
        }, 3000);
      } else {
        setTriggerMessage(`Trigger failed: ${data.error}`);
      }
    } catch (err: any) {
      setTriggerMessage("Network error triggering workflow");
    } finally {
      setTimeout(() => {
        setIsTriggering(false);
        setTriggerMessage(null);
      }, 4000);
    }
  };

  const getStatusBadge = (run: GitHubWorkflowRun) => {
    if (run.status === "in_progress" || run.status === "queued") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center space-x-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span className="capitalize">{run.status}</span>
        </span>
      );
    }
    if (run.conclusion === "success") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Success</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
        <XCircle className="w-3.5 h-3.5" />
        <span>Failure</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb / Top Row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchRuns}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="Refresh runs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleTriggerRun}
              disabled={isTriggering}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shadow-glow-indigo active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isTriggering ? "animate-pulse" : ""}`} />
              <span>{isTriggering ? "Triggering..." : "Trigger 4h Cloud Run Now"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {triggerMessage && (
          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm flex items-center space-x-2 animate-in fade-in">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{triggerMessage}</span>
          </div>
        )}

        {/* GitHub Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Cloud Runner Status */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Cloud Runner</h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className="font-mono text-slate-200">Ubuntu 24.04 (Latest)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Runtime:</span>
                <span className="font-mono text-slate-200">Python 3.12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Repository:</span>
                <a
                  href="https://github.com/vpnvv/vipin-job-search-automation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <span>vpnvv/...-automation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: 4-Hour Cron Cadence */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">4-Hour Cloud Schedule</h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Active
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Cron (UTC):</span>
                <code className="font-mono text-cyan-300">30 0,4,8,12,16,20 * * *</code>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Schedule (IST):</span>
                <span className="font-mono text-slate-200">06:00, 10:00, 14:00, 18:00, 22:00, 02:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mac Sleep Wake:</span>
                <span className="text-emerald-400 font-medium">Independent (Runs 24/7)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Encrypted Secrets */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">GitHub Secrets</h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                Encrypted
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">APIFY_TOKEN:</span>
                <span className="text-emerald-400 font-mono">✓ Configured</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GMAIL_APP_PASSWORD:</span>
                <span className="text-emerald-400 font-mono">✓ Configured</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Write Permissions:</span>
                <span className="text-emerald-400 font-mono">✓ contents: write</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Runs Table */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Github className="w-5 h-5 text-indigo-400" />
                <span>Workflow Execution History</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time execution logs from GitHub Actions cloud runner
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {runs.length} runs recorded
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Fetching workflow logs from GitHub...</p>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No workflow runs found. Click &lsquo;Trigger 4h Cloud Run Now&rsquo; to start the first cloud execution.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Workflow / Commit</th>
                    <th className="pb-3 font-semibold">Trigger Event</th>
                    <th className="pb-3 font-semibold">Branch / SHA</th>
                    <th className="pb-3 font-semibold">Executed At</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {runs.map((run) => (
                    <tr key={run.databaseId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-3">
                        {getStatusBadge(run)}
                      </td>
                      <td className="py-3.5 pr-3 font-medium text-white max-w-xs truncate">
                        <div className="truncate">{run.displayTitle || run.workflowName}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{run.workflowName}</div>
                      </td>
                      <td className="py-3.5 pr-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] font-mono border border-white/5">
                          {run.event}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-slate-300 font-mono text-xs">
                        <div className="flex items-center space-x-1">
                          <GitBranch className="w-3 h-3 text-slate-500" />
                          <span>{run.headBranch}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                          <GitCommit className="w-3 h-3" />
                          <span>{run.headSha ? run.headSha.substring(0, 7) : "HEAD"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 text-slate-400 text-xs">
                        {run.createdAt ? new Date(run.createdAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) : "N/A"}
                      </td>
                      <td className="py-3.5 text-right">
                        <a
                          href={`https://github.com/vpnvv/vipin-job-search-automation/actions/runs/${run.databaseId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-cyan-200 text-xs inline-flex items-center space-x-1 transition-all"
                        >
                          <span>Logs</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
