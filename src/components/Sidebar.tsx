import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  KeyRound,
  AlertCircle,
  CalendarDays,
  Receipt,
  Bell,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
    { name: 'Room Inventory', path: '/admin/rooms', icon: BedDouble },
    { name: 'Room Allocations', path: '/admin/allocations', icon: KeyRound },
    { name: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
    { name: 'Leave Requests', path: '/admin/leaves', icon: CalendarDays },
    { name: 'Fee Management', path: '/admin/fees', icon: Receipt },
    { name: 'Notice Board', path: '/admin/notices', icon: Bell },
  ];

  const studentNav = [
    { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Student Profile', path: '/student/profile', icon: UserCheck },
    { name: 'Room & Roommates', path: '/student/room', icon: BedDouble },
    { name: 'My Complaints', path: '/student/complaints', icon: AlertCircle },
    { name: 'Leave Requests', path: '/student/leaves', icon: CalendarDays },
    { name: 'Hostel Fees', path: '/student/fees', icon: Receipt },
    { name: 'Notice Board', path: '/student/notices', icon: Bell },
  ];

  const navigation = isAdmin ? adminNav : studentNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            {isAdmin ? 'Administration Portal' : 'Student Resident Portal'}
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-600 rounded-r-none'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* College Info Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-700">GTU Hostel Management</p>
        <p className="text-slate-400">BE Sem 5 Project · WAD & ADBMS</p>
        <div className="mt-2 flex items-center space-x-1.5 text-[10px] text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>MongoDB Engine Active</span>
        </div>
      </div>
    </aside>
  );
};
