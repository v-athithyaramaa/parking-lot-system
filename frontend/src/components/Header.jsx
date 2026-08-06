import React from "react";
import {
  ShieldCheck,
  Activity,
  RefreshCw,
  Cpu,
  Database,
  Server,
} from "lucide-react";
import { getApiBaseUrl } from "../services/api";

export function Header({ backendStatus, onRefreshStatus, checkingStatus }) {
  const isOnline = backendStatus.status === "online";

  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-700/60 shadow-lg shadow-emerald-500/5 group">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur" />
            <ShieldCheck className="w-6 h-6 text-emerald-400 relative z-10 transition-transform group-hover:scale-110 duration-200" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                Parking Command Center
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Server Status Badge & Quick Refresh */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isOnline
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : "bg-rose-950/30 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold hidden sm:inline">
                {isOnline ? "C++ Backend Online" : "Backend Offline"}
              </span>
              <span className="text-[11px] opacity-75 font-mono">
                {getApiBaseUrl().replace("http://", "")}
              </span>
            </div>
          </div>

          <button
            onClick={onRefreshStatus}
            disabled={checkingStatus}
            title="Check backend health"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all hover:bg-zinc-800/80 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${checkingStatus ? "animate-spin text-emerald-400" : ""}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
