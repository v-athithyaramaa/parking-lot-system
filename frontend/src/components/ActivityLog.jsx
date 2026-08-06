import React from 'react';
import { History, Trash2, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function ActivityLog({ logs = [], onClearLogs }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-7 shadow-xl shadow-black/40 backdrop-blur-xl text-center">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-zinc-400" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Live Transaction History</h3>
          </div>
        </div>
        <p className="text-xs text-zinc-400 py-6">
          No transactions yet in this session. Park or checkout a vehicle to view real-time activity.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-7 shadow-xl shadow-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              Live Transaction History
            </h3>
            <p className="text-xs text-zinc-400">
              Session audit trail of park and checkout operations.
            </p>
          </div>
        </div>

        <button
          onClick={onClearLogs}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all font-mono"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Log Items */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {logs.map((log) => {
          const isPark = log.action === 'PARK';
          const isSuccess = log.success;

          return (
            <div
              key={log.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors text-xs font-mono"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isSuccess
                      ? isPark
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isPark ? (
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100">{log.plate}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                        isPark ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                      }`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {log.message}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-zinc-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                {log.floor !== undefined && log.spot !== undefined && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 mt-1 inline-block">
                    F{log.floor}:#{log.spot}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
