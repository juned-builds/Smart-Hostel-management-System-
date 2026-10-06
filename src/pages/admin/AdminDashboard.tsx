import React, { useEffect, useState } from 'react';
import {
  Users,
  BedDouble,
  AlertCircle,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { DashboardStats } from '../../types/index.js';
import { StatCard } from '../../components/StatCard.js';
import { Badge } from '../../components/Badge.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500 text-sm">Computing hostel analytics from MongoDB...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-slate-500">
        Unable to load dashboard metrics. Check server connection.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hostel Warden Management Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy tracking, student affairs, grievance handling, and fee status.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg">
          <Database className="w-4 h-4 shrink-0 text-blue-600" />
          <span>MongoDB Aggregation Pipelines Active</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.students.total}
          subtitle={`${stats.students.allocated} Allocated · ${stats.students.unallocated} Unallocated`}
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Room Occupancy"
          value={`${stats.rooms.occupancyRate}%`}
          subtitle={`${stats.rooms.totalOccupied}/${stats.rooms.totalCapacity} Beds occupied (${stats.rooms.availableBeds} free)`}
          icon={BedDouble}
          color="emerald"
        />

        <StatCard
          title="Pending Complaints"
          value={stats.complaints.byStatus.Pending}
          subtitle={`${stats.complaints.byStatus['In Progress']} in progress · ${stats.complaints.byStatus.Resolved} resolved`}
          icon={AlertCircle}
          color="amber"
        />

        <StatCard
          title="Pending Leaves"
          value={stats.leaves.byStatus.Pending}
          subtitle={`${stats.leaves.byStatus.Approved} approved leaves`}
          icon={CalendarDays}
          color="rose"
        />
      </div>

      {/* Fee & Financial Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fee Collected</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">₹{stats.fees.totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-600 mt-0.5">{stats.fees.paidRecords} payments verified</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fee Pending</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">₹{stats.fees.pendingAmount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-amber-600 mt-0.5">{stats.fees.pendingRecords} invoices pending</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hostel Capacity</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.rooms.totalRooms} Rooms</p>
            <p className="text-xs text-slate-500 mt-0.5">Total capacity of {stats.rooms.totalCapacity} residents</p>
          </div>
        </div>
      </div>

      {/* Grid: Room Distribution by Block & Grievances by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Occupancy Breakdown (Demonstrating ADBMS Grouping) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Block-wise Occupancy (MongoDB $group)</h2>
            <Link to="/admin/rooms" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
              View Rooms <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {stats.roomsByBlock.map((blk) => {
              const pct = blk.capacity > 0 ? Math.round((blk.occupied / blk.capacity) * 100) : 0;
              return (
                <div key={blk._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{blk._id}</span>
                    <span className="text-slate-500">
                      {blk.occupied}/{blk.capacity} beds ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 90 ? 'bg-rose-500' : pct >= 50 ? 'bg-blue-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complaints Breakdown by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Grievances by Category</h2>
            <Link to="/admin/complaints" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {stats.complaints.byCategory.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No complaints recorded.</p>
            ) : (
              stats.complaints.byCategory.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
                  <span className="font-medium text-slate-700">{cat._id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {cat.count} ticket{cat.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Actionables: Complaints & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Grievances */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Recent Student Complaints</h2>
            <Link to="/admin/complaints" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Manage
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {stats.recent.complaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No recent complaints.</p>
            ) : (
              stats.recent.complaints.map((c) => (
                <div key={c._id} className="py-2.5 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800">{c.title}</p>
                    <p className="text-[11px] text-slate-500">
                      By {c.studentId?.fullName} ({c.category})
                    </p>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Recent Leave Applications</h2>
            <Link to="/admin/leaves" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Review
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {stats.recent.leaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No recent leave applications.</p>
            ) : (
              stats.recent.leaves.map((l) => (
                <div key={l._id} className="py-2.5 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800">
                      {l.studentId?.fullName} ({l.leaveType})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
