"use client";

import React from "react";
import { DashboardMetrics } from "@/lib/types";
import { Briefcase, Clock, CheckCircle2, XCircle, TrendingUp, Globe2 } from "lucide-react";

interface MetricsOverviewProps {
  metrics: DashboardMetrics;
  onFilterStatus?: (status: string) => void;
  onFilterRegion?: (region: string) => void;
}

export default function MetricsOverview({ metrics, onFilterStatus, onFilterRegion }: MetricsOverviewProps) {
  const cards = [
    {
      title: "Total Opportunities",
      value: metrics.total,
      subtitle: "Verified within 24h",
      icon: Briefcase,
      color: "text-blue-400",
      bgGlow: "from-blue-500/10 to-indigo-500/5",
      border: "hover:border-blue-500/30",
      onClick: () => onFilterStatus && onFilterStatus("All"),
    },
    {
      title: "Pending Applications",
      value: metrics.pending,
      subtitle: "Ready for review & dispatch",
      icon: Clock,
      color: "text-amber-400",
      bgGlow: "from-amber-500/10 to-orange-500/5",
      border: "hover:border-amber-500/30",
      onClick: () => onFilterStatus && onFilterStatus("Shortlisted"),
    },
    {
      title: "Applied Emails",
      value: metrics.applied,
      subtitle: "Submitted applications",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/10 to-teal-500/5",
      border: "hover:border-emerald-500/30",
      onClick: () => onFilterStatus && onFilterStatus("Applied"),
    },
    {
      title: "Ignored Opportunities",
      value: metrics.ignored,
      subtitle: "Filtered or skipped",
      icon: XCircle,
      color: "text-slate-400",
      bgGlow: "from-slate-500/10 to-gray-500/5",
      border: "hover:border-slate-500/30",
      onClick: () => onFilterStatus && onFilterStatus("Ignored"),
    },
    {
      title: "Avg Fit Score",
      value: `${metrics.avgScore}%`,
      subtitle: "100-pt rubric alignment",
      icon: TrendingUp,
      color: "text-purple-400",
      bgGlow: "from-purple-500/10 to-pink-500/5",
      border: "hover:border-purple-500/30",
    },
    {
      title: "Dubai / UAE vs India",
      value: `${metrics.uaeCount} UAE / ${metrics.indiaCount} IN`,
      subtitle: "+971 Dubai vs +91 India",
      icon: Globe2,
      color: "text-cyan-400",
      bgGlow: "from-cyan-500/10 to-blue-500/5",
      border: "hover:border-cyan-500/30",
      onClick: () => onFilterRegion && onFilterRegion("Dubai"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={card.onClick}
            className={`glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden group cursor-pointer ${card.border}`}
          >
            {/* Background ambient gradient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGlow} opacity-60 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 truncate">
                  {card.title}
                </span>
                <Icon className={`w-4 h-4 ${card.color} shrink-0`} />
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
