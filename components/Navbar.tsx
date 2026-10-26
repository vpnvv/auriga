"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Github, 
  RefreshCw, 
  Briefcase, 
  Clock, 
  Globe2, 
  CheckCircle2, 
  Send 
} from "lucide-react";

interface NavbarProps {
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export default function Navbar({ onRefresh, isRefreshing = false }: NavbarProps) {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleManualSync = async () => {
    if (syncing || isRefreshing) return;
    setSyncing(true);
    setSyncMessage("Syncing 4h cycle...");
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        const res = await fetch("/api/sync", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setSyncMessage("Updated!");
        }
      }
    } catch (e) {
      setSyncMessage("Sync error");
    } finally {
      setTimeout(() => {
        setSyncing(false);
        setSyncMessage(null);
      }, 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Status */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-glow-indigo">
              <div className="w-full h-full bg-slate-950/90 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AURIGA
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  4h Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Vipin V V • React.js & Frontend Developer (4+ YOE)
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/"
                ? "bg-white/10 text-white shadow-inner-light"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/github"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
              pathname === "/github"
                ? "bg-white/10 text-white shadow-inner-light"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Actions</span>
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* 4H Cron Indicator Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">Every 4h Cadence</span>
          </div>

          {/* Quick Manual Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={syncing || isRefreshing}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium text-slate-200 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh jobs & sync tracker"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${syncing || isRefreshing ? "animate-spin" : ""}`} />
            <span>{syncMessage || (syncing || isRefreshing ? "Syncing..." : "Sync Now")}</span>
          </button>

          {/* Repository Link */}
          <a
            href="https://github.com/vpnvv/vipin-job-search-automation"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Open GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
