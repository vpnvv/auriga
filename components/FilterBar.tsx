"use client";

import React from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  regionFilter: string;
  setRegionFilter: (r: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  totalFiltered: number;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  regionFilter,
  setRegionFilter,
  sortBy,
  setSortBy,
  totalFiltered,
}: FilterBarProps) {
  const statuses = [
    { id: "All", label: "All Opportunities" },
    { id: "Shortlisted", label: "Pending Review" },
    { id: "Applied", label: "Applied" },
    { id: "Ignored", label: "Ignored" },
  ];

  const regions = [
    { id: "All", label: "All Regions" },
    { id: "Dubai", label: "🇦🇪 Dubai / UAE (+971)" },
    { id: "Kochi", label: "🇮🇳 Kochi / Kerala" },
    { id: "Remote", label: "🌐 India Remote" },
  ];

  return (
    <div className="glass-panel p-4 rounded-2xl space-y-3.5">
      {/* Top search & sorting row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, job title, skills (e.g. Next.js, Redux, Dubai)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-200 cursor-pointer"
          >
            <option value="score_desc" className="bg-slate-900 text-white">Highest Fit Score (100-0)</option>
            <option value="date_desc" className="bg-slate-900 text-white">Newest First</option>
            <option value="company_asc" className="bg-slate-900 text-white">Company Name (A-Z)</option>
          </select>
          <span className="text-xs text-slate-400 font-mono shrink-0 pl-1">
            {totalFiltered} shown
          </span>
        </div>
      </div>

      {/* Filter pills: Status & Region */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mr-auto">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Status:</span>
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s.id
                  ? s.id === "Applied"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner-light"
                    : s.id === "Ignored"
                    ? "bg-slate-700/40 text-slate-200 border border-slate-600/40 shadow-inner-light"
                    : "bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 shadow-inner-light"
                  : "bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Region Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Region:</span>
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegionFilter(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                regionFilter === r.id
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-inner-light"
                  : "bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
