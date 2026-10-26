"use client";

import React from "react";
import { Job, DashboardMetrics } from "@/lib/types";
import { PieChart, BarChart3, Target, Compass } from "lucide-react";

interface ChartsSectionProps {
  jobs: Job[];
  metrics: DashboardMetrics;
}

export default function ChartsSection({ jobs, metrics }: ChartsSectionProps) {
  const total = metrics.total || 1;
  const appliedPct = Math.round((metrics.applied / total) * 100);
  const pendingPct = Math.round((metrics.pending / total) * 100);
  const ignoredPct = Math.round((metrics.ignored / total) * 100);

  // Region breakdown
  const uaeJobs = jobs.filter(j => j.country === "AE" || (j.location && j.location.toLowerCase().includes("dubai"))).length;
  const kochiJobs = jobs.filter(j => j.location && j.location.toLowerCase().includes("kochi")).length;
  const remoteJobs = jobs.filter(j => j.work_mode === "remote" || (j.location && j.location.toLowerCase().includes("remote"))).length;
  const otherIndiaJobs = Math.max(0, metrics.indiaCount - kochiJobs);

  const uaePct = Math.round((uaeJobs / total) * 100);
  const kochiPct = Math.round((kochiJobs / total) * 100);
  const remotePct = Math.round((remoteJobs / total) * 100);

  // Score tiers
  const tier90 = jobs.filter(j => (j.match_score || 0) >= 90).length;
  const tier80 = jobs.filter(j => (j.match_score || 0) >= 80 && (j.match_score || 0) < 90).length;
  const tier70 = jobs.filter(j => (j.match_score || 0) >= 70 && (j.match_score || 0) < 80).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Application Funnel & Status Distribution */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Application Status Distribution</h3>
          </div>
          <span className="text-xs text-slate-400">{total} Tracked</span>
        </div>

        {/* Multi-segment visual progress bar */}
        <div className="h-4 w-full rounded-full bg-slate-800/80 overflow-hidden flex p-0.5 border border-white/5 mb-4">
          <div
            style={{ width: `${pendingPct}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-full transition-all duration-500"
            title={`Pending: ${metrics.pending} (${pendingPct}%)`}
          />
          <div
            style={{ width: `${appliedPct}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            title={`Applied: ${metrics.applied} (${appliedPct}%)`}
          />
          <div
            style={{ width: `${ignoredPct}%` }}
            className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-r-full transition-all duration-500"
            title={`Ignored: ${metrics.ignored} (${ignoredPct}%)`}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-slate-300">Pending Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">{metrics.pending}</span>
              <span className="text-slate-400">({pendingPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-slate-300">Applied Jobs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-emerald-400">{metrics.applied}</span>
              <span className="text-slate-400">({appliedPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
              <span className="text-slate-300">Ignored / Skipped</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-300">{metrics.ignored}</span>
              <span className="text-slate-400">({ignoredPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Regional Breakdown: UAE vs India vs Remote */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Regional Opportunities</h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono">Dynamic +971/+91</span>
        </div>

        <div className="space-y-3">
          {/* Dubai / UAE */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <span>🇦🇪 Dubai / UAE (+971)</span>
              </span>
              <span className="font-semibold text-white">{uaeJobs} ({uaePct}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, uaePct)}%` }}
              />
            </div>
          </div>

          {/* Kochi / Kerala */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <span>🇮🇳 Kochi / Kerala (+91)</span>
              </span>
              <span className="font-semibold text-white">{kochiJobs} ({kochiPct}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, kochiPct)}%` }}
              />
            </div>
          </div>

          {/* India Remote */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <span>🌐 India Remote (+91)</span>
              </span>
              <span className="font-semibold text-white">{remoteJobs} ({remotePct}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, remotePct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Match Score Distribution */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">100-Point Match Tiers</h3>
          </div>
          <span className="text-xs text-purple-400 font-mono">Avg: {metrics.avgScore}%</span>
        </div>

        <div className="space-y-3">
          {/* 90-100% */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-emerald-400 font-medium">90% - 100% (High Alignment)</span>
              <span className="font-semibold text-white">{tier90} Roles</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(tier90 / total) * 100}%` }}
              />
            </div>
          </div>

          {/* 80-89% */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-400 font-medium">80% - 89% (Solid Fit)</span>
              <span className="font-semibold text-white">{tier80} Roles</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(tier80 / total) * 100}%` }}
              />
            </div>
          </div>

          {/* 70-79% */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-purple-400 font-medium">70% - 79% (Good Potential)</span>
              <span className="font-semibold text-white">{tier70} Roles</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(tier70 / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
