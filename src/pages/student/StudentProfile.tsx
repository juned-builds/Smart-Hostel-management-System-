import React, { useEffect, useState } from 'react';
import { UserCheck, Shield, KeyRound, Mail, Phone, MapPin, Building, GraduationCap, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setProfile(res.data.user);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setPasswordMsg({ text: 'Password successfully updated!', success: true });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update password.',
        success: false,
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500 text-xs">Loading student profile...</div>
      </div>
    );
  }

  const s = profile?.student;
  const room = s?.roomId;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Student Profile & Academic Record</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review registered academic credentials, emergency contacts, and residential room allotment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Academic Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                {profile?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{profile?.name}</h2>
                <p className="text-xs font-mono text-blue-600 font-semibold">{s?.enrollmentNo}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{s?.department || 'Engineering'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Semester</span>
                <span className="font-semibold text-slate-800">Semester {s?.semester || 5}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="font-semibold text-slate-800">{profile?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Mobile Number</span>
                <span className="font-semibold text-slate-800">{s?.phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="font-semibold text-slate-800">{s?.gender || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Account Status</span>
                <span className="font-semibold text-emerald-600">Active Student</span>
              </div>
            </div>
          </div>

          {/* Guardian & Permanent Address Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Guardian & Emergency Contact Information
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Guardian Name</span>
                <span className="font-semibold text-slate-800">{s?.guardianName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Guardian Contact</span>
                <span className="font-semibold text-slate-800">{s?.guardianPhone || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Permanent Home Address</span>
                <span className="text-slate-800 mt-0.5 block">{s?.address || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Room allotment & Change Password */}
        <div className="space-y-6">
          {/* Room Allocation Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Residential Allotment
            </h3>
            {room ? (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                  <div className="font-bold text-sm">Room {room.roomNumber}</div>
                  <div className="text-xs">{room.block}</div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bed Number</span>
                  <span className="font-semibold text-slate-800">{s?.bedNo || 'Bed 1'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Floor</span>
                  <span className="font-semibold text-slate-800">Floor {room.floor}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Room Type</span>
                  <span className="font-semibold text-slate-800">{room.type}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">No room allocated yet.</p>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </h3>

            {passwordMsg && (
              <div
                className={`mb-3 p-2 rounded text-[11px] ${
                  passwordMsg.success
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded transition-colors disabled:opacity-50"
              >
                {submittingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
