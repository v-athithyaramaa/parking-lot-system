import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ParkCard } from './components/ParkCard';
import { CheckoutCard } from './components/CheckoutCard';
import { SpotVisualizer } from './components/SpotVisualizer';
import { ActivityLog } from './components/ActivityLog';
import { ToastContainer } from './components/Toast';
import {
  parkVehicle,
  checkoutVehicle,
  checkAvailability,
  getApiBaseUrl,
} from './services/api';
import { Cpu, Database, CheckCircle2, ShieldCheck, ArrowUpRight, Terminal } from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ status: 'checking', message: '' });
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [parkLoading, setParkLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [recentTicket, setRecentTicket] = useState(null);
  const [recentCheckout, setRecentCheckout] = useState(null);
  const [activeVehicles, setActiveVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem('parked_vehicles_session');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('parking_audit_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('parked_vehicles_session', JSON.stringify(activeVehicles));
    } catch (_) {}
  }, [activeVehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('parking_audit_logs', JSON.stringify(logs));
    } catch (_) {}
  }, [logs]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const checkBackendHealth = useCallback(async () => {
    setCheckingStatus(true);
    try {
      const data = await checkAvailability();
      setBackendStatus({
        status: 'online',
        message: data.message || 'Operational',
        totalLevels: data.totalLevels || (Array.isArray(data.levels) ? data.levels.length : 3),
        totalSpots: data.totalSpots || 18,
        availableSpots: data.availableSpots !== undefined ? data.availableSpots : 18,
        levels: Array.isArray(data.levels) ? data.levels : [],
      });
    } catch (err) {
      setBackendStatus({
        status: 'offline',
        message: err.message || 'Connection failed',
        totalLevels: 3,
        totalSpots: 18,
        availableSpots: 0,
        levels: [],
      });
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 20000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const handlePark = async (plate, type) => {
    setParkLoading(true);
    try {
      const res = await parkVehicle(plate, type);

      if (res.success) {
        const newVehicle = {
          plate: res.plate,
          type: res.type || type,
          floor: res.floor,
          spot: res.spot,
          ticketId: res.ticketId,
          timestamp: res.timestamp,
        };

        setActiveVehicles((prev) => {
          const filtered = prev.filter((v) => v.plate !== res.plate);
          return [...filtered, newVehicle];
        });

        setRecentTicket(newVehicle);

        setLogs((prev) => [
          {
            id: Date.now().toString(),
            action: 'PARK',
            plate: res.plate,
            success: true,
            message: `Parked at Floor ${res.floor}, Spot #${res.spot}`,
            floor: res.floor,
            spot: res.spot,
            ticketId: res.ticketId,
            timestamp: res.timestamp,
          },
          ...prev.slice(0, 49),
        ]);

        addToast({
          type: 'success',
          title: 'Vehicle Parked Successfully',
          message: `Vehicle ${res.plate} allocated to Floor ${res.floor}, Spot #${res.spot}.`,
          code: 200,
          ticketId: res.ticketId,
          details: { floor: res.floor, spot: res.spot },
        });

        return true;
      } else {
        setLogs((prev) => [
          {
            id: Date.now().toString(),
            action: 'PARK',
            plate: plate,
            success: false,
            message: res.message || 'Parking lot is full',
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);

        addToast({
          type: res.statusCode === 409 ? 'warning' : 'error',
          title: res.statusCode === 409 ? 'Parking Lot Full' : 'Parking Allocation Failed',
          message: res.message || 'Unable to park vehicle.',
          code: res.statusCode,
        });

        return false;
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Network / Backend Error',
        message: err.message || 'Failed to reach C++ microservice on port 8080.',
      });
      return false;
    } finally {
      setParkLoading(false);
    }
  };

  const handleCheckout = async (plate) => {
    setCheckoutLoading(true);
    try {
      const res = await checkoutVehicle(plate);

      if (res.success) {
        setActiveVehicles((prev) => prev.filter((v) => v.plate !== res.plate));

        const checkoutInfo = {
          plate: res.plate,
          message: res.message,
          timestamp: res.timestamp,
        };
        setRecentCheckout(checkoutInfo);

        setLogs((prev) => [
          {
            id: Date.now().toString(),
            action: 'CHECKOUT',
            plate: res.plate,
            success: true,
            message: res.message || 'Spot freed successfully',
            timestamp: res.timestamp,
          },
          ...prev.slice(0, 49),
        ]);

        addToast({
          type: 'success',
          title: 'Vehicle Checked Out',
          message: `${res.plate}: ${res.message}`,
          code: 200,
        });

        return true;
      } else {
        setLogs((prev) => [
          {
            id: Date.now().toString(),
            action: 'CHECKOUT',
            plate: plate,
            success: false,
            message: res.message || 'Checkout failed. Plate not found.',
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 49),
        ]);

        addToast({
          type: 'error',
          title: 'Checkout Failed',
          message: res.message || 'Plate not found in parking database.',
          code: res.statusCode || 404,
        });

        return false;
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Network / Backend Error',
        message: err.message || 'Failed to reach C++ microservice on port 8080.',
      });
      return false;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <Header
        backendStatus={backendStatus}
        onRefreshStatus={checkBackendHealth}
        checkingStatus={checkingStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Microservice Status
              </div>
              <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {backendStatus.status === 'online' ? 'Operational' : 'Service Unreachable'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Active In-Lot
              </div>
              <div className="text-sm font-bold text-zinc-100 mt-0.5">
                {activeVehicles.length} of {backendStatus.totalSpots || 18} Allocated
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Facility Scale
              </div>
              <div className="text-sm font-bold text-zinc-100 mt-0.5">
                {backendStatus.totalLevels || 3} Floors • 18 Spots
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                API Base Target
              </div>
              <div className="text-sm font-mono font-bold text-zinc-100 mt-0.5 truncate max-w-[160px]">
                {getApiBaseUrl()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <ParkCard
            onPark={handlePark}
            loading={parkLoading}
            recentTicket={recentTicket}
          />

          <CheckoutCard
            onCheckout={handleCheckout}
            loading={checkoutLoading}
            activeVehicles={activeVehicles}
            recentCheckout={recentCheckout}
          />
        </div>

        <SpotVisualizer
          activeVehicles={activeVehicles}
          onQuickCheckout={handleCheckout}
          loading={checkoutLoading}
          levelsData={backendStatus.levels}
          totalLevels={backendStatus.totalLevels || 3}
          spotsPerLevel={6}
        />

        <ActivityLog logs={logs} onClearLogs={clearLogs} />
      </main>

      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">Parking Command Center</span>
            <span>•</span>
            <span>REST API C++ Microservice Client</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> POST /park (200, 409)
            </span>
            <span className="flex items-center gap-1 text-rose-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> POST /checkout (200, 404)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
