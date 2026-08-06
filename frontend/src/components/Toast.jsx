import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Copy, Check } from 'lucide-react';

export function ToastItem({ toast, onDismiss }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 6000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-zinc-900/95',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
          Icon: CheckCircle2,
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'error':
        return {
          border: 'border-rose-500/30',
          bg: 'bg-zinc-900/95',
          iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
          Icon: AlertCircle,
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        };
      case 'warning':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-zinc-900/95',
          iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
          Icon: AlertTriangle,
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      default:
        return {
          border: 'border-cyan-500/30',
          bg: 'bg-zinc-900/95',
          iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
          glow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
          Icon: Info,
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        };
    }
  };

  const style = getStyle();
  const IconComponent = style.Icon;

  return (
    <div
      className={`relative flex items-start gap-3.5 p-4 rounded-xl backdrop-blur-md border ${style.border} ${style.bg} ${style.glow} animate-slide-right w-full max-w-sm sm:max-w-md shadow-2xl transition-all hover:translate-y-[-2px]`}
      role="alert"
    >
      <div className={`p-2 rounded-lg shrink-0 ${style.iconBg}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-zinc-100">{toast.title}</h4>
          {toast.code && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${style.badge}`}>
              HTTP {toast.code}
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed break-words">{toast.message}</p>

        {toast.ticketId && (
          <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Ticket:</span>
            <div className="flex items-center gap-1.5 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800 font-mono text-[11px] text-emerald-400">
              <span>{toast.ticketId}</span>
              <button
                onClick={() => handleCopy(toast.ticketId)}
                title="Copy Ticket ID"
                className="text-zinc-400 hover:text-zinc-200 transition-colors ml-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {toast.details && (
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] bg-zinc-950/50 p-2 rounded border border-zinc-800/60 font-mono">
            {toast.details.floor !== undefined && (
              <div>
                <span className="text-zinc-500">Floor: </span>
                <span className="text-zinc-200 font-semibold">{toast.details.floor}</span>
              </div>
            )}
            {toast.details.spot !== undefined && (
              <div>
                <span className="text-zinc-500">Spot: </span>
                <span className="text-zinc-200 font-semibold">{toast.details.spot}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors shrink-0 -mr-1 -mt-1"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-[calc(100vw-2.5rem)] pointer-events-auto">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
