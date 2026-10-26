"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Github, Globe } from "lucide-react";

interface MobileBottomNavProps {
  onFilterStatus?: (status: string) => void;
  activeStatusFilter?: string;
}

export default function MobileBottomNav({ onFilterStatus, activeStatusFilter }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#090d16]/90 backdrop-blur-2xl border-t border-white/[0.08] px-4 py-2 safe-bottom">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          onClick={() => onFilterStatus && onFilterStatus("All")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            pathname === "/" && activeStatusFilter === "All"
              ? "text-cyan-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>

        <button
          onClick={() => onFilterStatus && onFilterStatus("Applied")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeStatusFilter === "Applied"
              ? "text-emerald-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Applied</span>
        </button>

        <button
          onClick={() => onFilterStatus && onFilterStatus("Dubai")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeStatusFilter === "Dubai"
              ? "text-amber-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">UAE / Dubai</span>
        </button>

        <Link
          href="/github"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            pathname === "/github"
              ? "text-indigo-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Github className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">GitHub</span>
        </Link>
      </div>
    </div>
  );
}
