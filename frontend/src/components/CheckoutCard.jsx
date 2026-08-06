import React, { useState } from 'react';
import { LogOut, ArrowRight, Loader2, Tag, Check, AlertCircle, Sparkles } from 'lucide-react';

export function CheckoutCard({ onCheckout, loading, activeVehicles = [], recentCheckout }) {
  const [plate, setPlate] = useState('');
  const [inputError, setInputError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPlate = plate.trim().toUpperCase();

    if (!cleanPlate) {
      setInputError('Please enter a license plate to checkout');
      return;
    }

    setInputError('');
    const success = await onCheckout(cleanPlate);
    if (success) {
      setPlate('');
    }
  };

  const handleSelectParked = (parkedPlate) => {
    setPlate(parkedPlate);
    setInputError('');
  };

  return (
    <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-7 shadow-xl shadow-black/40 backdrop-blur-xl flex flex-col justify-between overflow-hidden group hover:border-zinc-700/80 transition-all duration-300">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500/0 via-rose-500/60 to-rose-500/0" />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                Checkout Vehicle
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  POST /checkout
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Remove vehicle, free memory spot, and clear record from SQLite.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* License Plate Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="checkout-plate-input" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" /> License Plate Number
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">Case-insensitive</span>
            </div>

            <div className="relative">
              <input
                id="checkout-plate-input"
                type="text"
                value={plate}
                onChange={(e) => {
                  setPlate(e.target.value.toUpperCase());
                  if (inputError) setInputError('');
                }}
                placeholder="ENTER VEHICLE PLATE TO CHECKOUT"
                maxLength={15}
                disabled={loading}
                className={`w-full bg-zinc-950/80 border ${
                  inputError
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-zinc-800 focus:border-rose-500/60 focus:ring-rose-500/20'
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

          {/* Quick Select from Active Parked Vehicles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Currently Parked Vehicles:
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                {activeVehicles.length} active
              </span>
            </div>

            {activeVehicles.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
                {activeVehicles.map((v) => (
                  <button
                    key={v.plate}
                    type="button"
                    onClick={() => handleSelectParked(v.plate)}
                    disabled={loading}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      plate === v.plate
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30'
                        : 'bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    } disabled:opacity-50`}
                  >
                    <span className="font-bold">{v.plate}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                      F{v.floor}:#{v.spot}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-center text-xs text-zinc-400">
                No active parked vehicles tracked in current session. Enter plate manually or park a car first.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !plate.trim()}
            className="w-full relative group overflow-hidden rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold text-sm sm:text-base py-3.5 px-4 shadow-lg shadow-rose-950/50 hover:shadow-rose-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Checkout...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 duration-200" />
                <span>Checkout Vehicle</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200 ml-auto" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Checkout Status Snapshot */}
      {recentCheckout && (
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold text-rose-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Recent Checkout Completed
            </span>
            <span className="font-mono text-[10px] text-zinc-400">{new Date(recentCheckout.timestamp).toLocaleTimeString()}</span>
          </div>

          <div className="bg-zinc-950/90 rounded-xl p-3 border border-rose-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <div className="font-mono font-bold text-zinc-100 text-sm tracking-wide">{recentCheckout.plate}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5 truncate">{recentCheckout.message}</div>
            </div>
            <div className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] font-semibold shrink-0">
              Spot Released
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
