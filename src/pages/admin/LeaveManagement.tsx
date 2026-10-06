import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle, XCircle, Clock, ShieldCheck, MapPin, Phone } from 'lucide-react';
import api from '../../api/client.js';
import { LeaveRequest } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';
import { Modal } from '../../components/Modal.js';

export const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Review modal
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionStatus, setActionStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/leaves', { params });
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleOpenReview = (leave: LeaveRequest, initialStatus: 'Approved' | 'Rejected') => {
    setSelectedLeave(leave);
    setActionStatus(initialStatus);
    setAdminRemarks(
      initialStatus === 'Approved'
        ? 'Approved. Gate pass issued. Must return before 8:00 PM.'
        : 'Rejected due to upcoming mid-semester examinations.'
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/leaves/${selectedLeave._id}`, {
        status: actionStatus,
        adminRemarks,
      });
      if (res.data.success) {
        setSelectedLeave(null);
        fetchLeaves();
      }
    } catch (err) {
      console.error('Failed to review leave:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Student Out-Pass & Leave Approvals</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review gate out-passes, verify parental contacts, and approve night leave permissions.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 text-xs">
        <label className="font-semibold text-slate-700">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-hidden"
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved Leaves</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Student & Contact</th>
                <th className="py-3 px-4">Leave Duration</th>
                <th className="py-3 px-4">Type & Reason</th>
                <th className="py-3 px-4">Destination & Emergency Contact</th>
                <th className="py-3 px-4">Status & Warden Remarks</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No leave requests matching filter.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const s = leave.studentId;
                  const room = s?.roomId as any;
                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s?.fullName}</div>
                        <div className="text-[11px] font-mono text-blue-600">{s?.enrollmentNo}</div>
                        <div className="text-[11px] text-slate-500">
                          {room ? `Room ${room.roomNumber}` : 'No Room'} · {s?.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          to {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                          {leave.leaveType}
                        </span>
                        <div className="text-slate-700 mt-1">{leave.reason}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-slate-600 space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{leave.destinationAddress || 'Home'}</span>
                        </div>
                        <div className="flex items-center text-slate-600 space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-[11px]">{leave.emergencyContact || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={leave.status} />
                        {leave.adminRemarks && (
                          <div className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-1 rounded border border-slate-100">
                            "{leave.adminRemarks}"
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenReview(leave, 'Approved')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenReview(leave, 'Rejected')}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded font-medium text-[11px]"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title={`Review Out-Pass Application: ${selectedLeave?.studentId?.fullName || ''}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Decision</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionStatus('Approved')}
                className={`py-2 px-3 rounded border text-center font-semibold transition-all ${
                  actionStatus === 'Approved'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Approve Gate Pass
              </button>
              <button
                type="button"
                onClick={() => setActionStatus('Rejected')}
                className={`py-2 px-3 rounded border text-center font-semibold transition-all ${
                  actionStatus === 'Rejected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Reject Request
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Warden Remarks / Instructions
            </label>
            <textarea
              rows={3}
              required
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setSelectedLeave(null)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Confirm Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
