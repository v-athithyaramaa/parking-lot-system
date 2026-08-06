import React, { useState } from 'react';
import { Car, PlusCircle, ArrowRight, Loader2, Sparkles, Tag, Check, Hash } from 'lucide-react';

const VEHICLE_TYPES = [
  { id: 'Car', label: 'Car', icon: '🚗', desc: 'Standard Spot' },
  { id: 'Motorcycle', label: 'Motorcycle', icon: '🏍️', desc: 'Compact Spot' },
  { id: 'Truck', label: 'Truck', icon: '🚚', desc: 'Heavy Spot' },
];

const PRESET_PLATES = ['KA-01-AB-1234', 'MH-02-CP-8840', 'DL-3C-AZ-9901', 'TX-742-CR'];

export function ParkCard({ onPark, loading, recentTicket }) {
  const [plate, setPlate] = useState('');
  const [type, setType] = useState('Car');
  const [inputError, setInputError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPlate = plate.trim().toUpperCase();

    if (!cleanPlate) {
      setInputError('Please enter a license plate');
      return;
    }

    if (cleanPlate.length < 2) {
      setInputError('License plate must be at least 2 characters');
      return;
    }

    setInputError('');
    const success = await onPark(cleanPlate, type);
    if (success) {
      setPlate('');
    }
  };

  const handleSelectPreset = (preset) => {
    setPlate(preset);
    setInputError('');
  };

  return (
    <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-7 shadow-xl shadow-black/40 backdrop-blur-xl flex flex-col justify-between overflow-hidden group hover:border-zinc-700/80 transition-all duration-300">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                Park Vehicle
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  POST /park
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Register entry and allocate an available spot in memory & SQLite.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* License Plate Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="park-plate-input" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" /> License Plate Number
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">e.g. KA-01-AB-1234</span>
            </div>

            <div className="relative">
              <input
                id="park-plate-input"
                type="text"
                value={plate}
                onChange={(e) => {
                  setPlate(e.target.value.toUpperCase());
                  if (inputError) setInputError('');
                }}
                placeholder="ENTER VEHICLE PLATE"
                maxLength={15}
                disabled={loading}
                className={`w-full bg-zinc-950/80 border ${
                  inputError
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-zinc-800 focus:border-emerald-500/60 focus:ring-emerald-500/20'
                } rounded-xl px-4 py-3 text-sm sm:text-base font-mono tracking-wider text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-4 transition-all uppercase disabled:opacity-50`}
              />
              {plate && (
                <button
                  type="button"
                  onClick={() => setPlate('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 hover:text-zinc-300 px-1.5 py-0.5 rounded bg-zinc-800/80"
                >
                  Clear
                </button>
              )}
            </div>

            {inputError && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                <span>•</span> {inputError}
              </p>
            )}
          </div>

          {/* Vehicle Type Selection */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Vehicle Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_TYPES.map((v) => {
                const isSelected = type === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setType(v.id)}
                    disabled={loading}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/60'
                    } disabled:opacity-50`}
                  >
                    <span className="text-lg mb-0.5">{v.icon}</span>
                    <span className="text-xs font-semibold">{v.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{v.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-400/80" /> Quick test sample plates:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PLATES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  disabled={loading}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700 transition-all disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !plate.trim()}
            className="w-full relative group overflow-hidden rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm sm:text-base py-3.5 px-4 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Allocation...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                <span>Park Vehicle</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200 ml-auto" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Success Ticket Snapshot */}
      {recentTicket && (
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Last Issued Ticket
            </span>
            <span className="font-mono text-[10px] text-zinc-400">{new Date(recentTicket.timestamp).toLocaleTimeString()}</span>
          </div>

          <div className="bg-zinc-950/90 rounded-xl p-3 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <div className="font-mono font-bold text-zinc-100 text-sm tracking-wide">{recentTicket.plate}</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">{recentTicket.ticketId}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Floor / Spot</div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  F{recentTicket.floor} • Spot #{recentTicket.spot}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
