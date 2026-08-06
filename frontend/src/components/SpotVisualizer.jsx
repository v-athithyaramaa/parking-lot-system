import React, { useState } from 'react';
import { LayoutGrid, CheckCircle2, ShieldAlert, Car, LogOut, Layers, ChevronRight } from 'lucide-react';

const SPOT_TYPES_MAP = {
  1: { type: 'Motorcycle', icon: '🏍️' },
  2: { type: 'Car', icon: '🚗' },
  3: { type: 'Car', icon: '🚗' },
  4: { type: 'Truck', icon: '🚚' },
  5: { type: 'Motorcycle', icon: '🏍️' },
  6: { type: 'Car', icon: '🚗' },
};

export function SpotVisualizer({
  activeVehicles = [],
  onQuickCheckout,
  loading,
  levelsData = [],
  totalLevels = 3,
  spotsPerLevel = 6,
}) {
  const [selectedFloor, setSelectedFloor] = useState(1);

  // Generate levels configuration from backend response or default
  const levelsCount = levelsData.length > 0 ? levelsData.length : totalLevels;
  const levelsList = Array.from({ length: levelsCount }, (_, i) => i + 1);

  // Calculate overall metrics
  const totalSystemSpots = levelsCount * spotsPerLevel;
  const totalOccupied = activeVehicles.length;
  const totalAvailable = Math.max(0, totalSystemSpots - totalOccupied);
  const overallOccupancyPct = Math.round((totalOccupied / totalSystemSpots) * 100);

  // Filter vehicles on selected floor
  const floorVehicles = activeVehicles.filter(
    (v) => Number(v.floor) === selectedFloor
  );
  const floorOccupiedCount = floorVehicles.length;
  const floorAvailableCount = Math.max(0, spotsPerLevel - floorOccupiedCount);

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-7 shadow-xl shadow-black/40 backdrop-blur-xl space-y-6">
      {/* Header & Overall Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              Multi-Level Spot Grid & Real-Time Allocation
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {levelsCount} Floors • {totalSystemSpots} Total Spots
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live spot allocation and occupancy across all parking facility levels.
            </p>
          </div>
        </div>

        {/* Global Facility Availability Banner */}
        <div className="flex items-center gap-4 bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800 font-mono text-xs self-start lg:self-auto">
          <div>
            <span className="text-zinc-400">Total Free: </span>
            <span className="text-emerald-400 font-bold">{totalAvailable} / {totalSystemSpots}</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div>
            <span className="text-zinc-400">Total Occupied: </span>
            <span className={`font-bold ${totalOccupied === totalSystemSpots ? 'text-rose-400' : 'text-zinc-200'}`}>
              {totalOccupied}
            </span>
          </div>
        </div>
      </div>

      {/* Level / Floor Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center gap-1.5 bg-zinc-950/90 p-1.5 rounded-xl border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 px-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Floor:
          </span>
          {levelsList.map((floorNum) => {
            const isSelected = selectedFloor === floorNum;
            const floorActiveCount = activeVehicles.filter(
              (v) => Number(v.floor) === floorNum
            ).length;

            return (
              <button
                key={floorNum}
                onClick={() => setSelectedFloor(floorNum)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                }`}
              >
                <span>Floor {floorNum}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    floorActiveCount > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {spotsPerLevel - floorActiveCount} free
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Floor Summary Badge */}
        <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
          <span>Floor {selectedFloor} Status:</span>
          <span className="text-emerald-400 font-bold">{floorAvailableCount} Available</span>
          <span>•</span>
          <span className="text-zinc-300">{floorOccupiedCount} Occupied</span>
        </div>
      </div>

      {/* Selected Floor Spots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: spotsPerLevel }, (_, idx) => {
          const spotNum = idx + 1;
          const spotMeta = SPOT_TYPES_MAP[spotNum] || { type: 'Car', icon: '🚗' };
          const vehicle = activeVehicles.find(
            (v) => Number(v.floor) === selectedFloor && Number(v.spot) === spotNum
          );
          const isOccupied = !!vehicle;

          return (
            <div
              key={spotNum}
              className={`relative rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between min-h-[145px] ${
                isOccupied
                  ? 'bg-zinc-950/90 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.08)] ring-1 ring-rose-500/20'
                  : 'bg-zinc-950/50 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-zinc-950/80 shadow-[0_0_15px_rgba(16,185,129,0.04)]'
              }`}
            >
              {/* Top Row: Spot # & Type Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-zinc-100">
                  <span className="text-sm">{spotMeta.icon}</span>
                  <span>F{selectedFloor}:S{spotNum}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                    isOccupied
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}
                >
                  {isOccupied ? 'Occupied' : 'Free'}
                </span>
              </div>

              {/* Middle: Vehicle details or Spot capability */}
              <div className="my-2">
                {isOccupied ? (
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-zinc-100 tracking-wider truncate">
                      {vehicle.plate}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                      <span>{vehicle.type || spotMeta.type}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-400 font-mono">
                    <div>For: <span className="text-zinc-300 font-semibold">{spotMeta.type}</span></div>
                    <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              {isOccupied ? (
                <button
                  type="button"
                  onClick={() => onQuickCheckout(vehicle.plate)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-mono font-semibold transition-colors disabled:opacity-50"
                  title="Checkout this vehicle directly"
                >
                  <LogOut className="w-2.5 h-2.5" /> Free Spot
                </button>
              ) : (
                <div className="text-[10px] text-zinc-400 font-mono text-center py-0.5">
                  Spot #{spotNum}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Facility Capacity Load Bar */}
      <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-4">
        <span className="text-xs font-mono text-zinc-400 shrink-0">Total Facility Load:</span>
        <div className="flex-1 bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallOccupancyPct >= 100
                ? 'bg-rose-500'
                : overallOccupancyPct > 60
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${overallOccupancyPct}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-zinc-300 shrink-0">
          {overallOccupancyPct}% ({totalOccupied}/{totalSystemSpots})
        </span>
      </div>
    </div>
  );
}
