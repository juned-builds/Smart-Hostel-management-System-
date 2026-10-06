import React, { useState } from 'react';
import { Building2, LogOut, RotateCcw, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import api from '../api/client.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all hostel database collections to default demo state?')) {
      return;
    }
    setResetting(true);
    try {
      const res = await api.post('/seed/reset');
      if (res.data.success) {
        setResetMessage('Demo data restored!');
        setTimeout(() => {
          setResetMessage(null);
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">SMART HOSTEL</span>
                <span className="text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  GTU B.E. Sem 5
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gujarat Technological University · Campus Residence System
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {resetMessage ? (
              <span className="flex items-center text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {resetMessage}
              </span>
            ) : (
              <button
                onClick={handleResetDemoData}
                disabled={resetting}
                title="Reset database to demo seed data"
                className="hidden md:flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
              </button>
            )}

            {/* User Info */}
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {user?.role === 'admin' ? 'Hostel Warden / Admin' : `Student · ${user?.enrollmentNo || 'GTU'}`}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center space-x-1.5 text-xs text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-3 py-1.5 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
