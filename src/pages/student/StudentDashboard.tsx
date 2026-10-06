import React, { useEffect, useState } from 'react';
import {
  BedDouble,
  AlertCircle,
  CalendarDays,
  Receipt,
  Bell,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../api/client.js';
import { StatCard } from '../../components/StatCard.js';
import { Badge } from '../../components/Badge.js';
import { Notice } from '../../types/index.js';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const [meRes, compRes, leaveRes, feeRes, notRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/complaints'),
          api.get('/leaves'),
          api.get('/fees'),
          api.get('/notices'),
        ]);

        if (meRes.data.success) {
          setProfileData(meRes.data.user.student);
          if (meRes.data.user.student?._id) {
            const studentDetailRes = await api.get(`/students/${meRes.data.user.student._id}`);
            if (studentDetailRes.data.success) {
              setRoomData(studentDetailRes.data.data);
            }
          }
        }
        if (compRes.data.success) setComplaints(compRes.data.data);
        if (leaveRes.data.success) setLeaves(leaveRes.data.data);
        if (feeRes.data.success) setFees(feeRes.data.data);
        if (notRes.data.success) setNotices(notRes.data.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500 text-xs">Loading student portal...</div>
      </div>
    );
  }

  const room = roomData?.student?.roomId;
  const roommates = roomData?.roommates || [];
  const pendingComplaints = complaints.filter((c) => c.status !== 'Resolved').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'Approved').length;
  const pendingFees = fees.filter((f) => f.status !== 'Paid').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-mono font-medium">
              {profileData?.enrollmentNo || user?.enrollmentNo}
            </span>
          </div>
          <p className="text-xs text-blue-200 mt-1">
            {profileData?.department} · Semester {profileData?.semester} · Resident Portal
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2.5 rounded-lg flex items-center space-x-3">
          <BedDouble className="w-6 h-6 text-blue-300" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-blue-200">Allocated Room</div>
            <div className="text-sm font-bold text-white">
              {room ? `Room ${room.roomNumber} (${room.block})` : 'Not Allocated Yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Room Status"
          value={room ? `Room ${room.roomNumber}` : 'Pending'}
          subtitle={room ? `${roommates.length} roommate(s)` : 'Awaiting warden allotment'}
          icon={BedDouble}
          color="blue"
        />

        <StatCard
          title="Active Grievances"
          value={pendingComplaints}
          subtitle={`${complaints.length - pendingComplaints} resolved tickets`}
          icon={AlertCircle}
          color="amber"
        />

        <StatCard
          title="Approved Gate Passes"
          value={approvedLeaves}
          subtitle={`${leaves.length} total leave applications`}
          icon={CalendarDays}
          color="emerald"
        />

        <StatCard
          title="Fee Status"
          value={pendingFees === 0 ? 'All Cleared' : `${pendingFees} Pending`}
          subtitle={pendingFees === 0 ? 'Receipts available' : 'Check dues section'}
          icon={Receipt}
          color={pendingFees === 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Grid: Roommates & Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roommates Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Room & Roommates</h2>
            </div>
            <Link to="/student/room" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              View Room <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
            </Link>
          </div>

          <div className="mt-4">
            {room ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs flex justify-between">
                  <div>
                    <span className="font-bold text-blue-900">Room {room.roomNumber}</span>
                    <span className="text-blue-700 block mt-0.5">{room.block} · Floor {room.floor}</span>
                  </div>
                  <span className="text-blue-700 font-medium">{profileData?.bedNo || 'Bed 1'}</span>
                </div>

                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  My Roommates ({roommates.length})
                </p>
                {roommates.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No other roommates in this room yet.</p>
                ) : (
                  <div className="space-y-2">
                    {roommates.map((rm: any) => (
                      <div
                        key={rm._id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{rm.fullName}</p>
                          <p className="text-[11px] text-slate-500">{rm.department} (Sem {rm.semester})</p>
                        </div>
                        <span className="text-[11px] font-mono text-blue-600">{rm.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                You have not been assigned a room yet. Please contact the warden office.
              </div>
            )}
          </div>
        </div>

        {/* Latest Notices */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Hostel Notice Board</h2>
            </div>
            <Link to="/student/notices" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              View All <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {notices.slice(0, 3).map((n) => (
              <div key={n._id} className="py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {n.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-1">{n.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
