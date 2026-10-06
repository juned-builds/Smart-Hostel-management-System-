import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Filter, MessageSquare, Wrench } from 'lucide-react';
import api from '../../api/client.js';
import { Complaint } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';
import { Modal } from '../../components/Modal.js';

export const ComplaintManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Review modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<'Pending' | 'In Progress' | 'Resolved' | 'Rejected'>('In Progress');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleOpenAction = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setResolutionRemarks(c.resolutionRemarks || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/complaints/${selectedComplaint._id}`, {
        status: newStatus,
        resolutionRemarks,
      });
      if (res.data.success) {
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      console.error('Failed to update complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hostel Complaints & Maintenance Desk</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review grievances, assign technical staff (electrician/plumber), and post resolution updates.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="font-semibold text-slate-700 mr-2">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 mr-2">Maintenance Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Wi-Fi/Internet">Wi-Fi/Internet</option>
            <option value="Mess/Food">Mess/Food</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Grievance / Title</th>
                <th className="py-3 px-4">Student & Room</th>
                <th className="py-3 px-4">Category & Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Resolution Remarks</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No complaints matching current filters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const room = c.studentId?.roomId as any;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900">{c.title}</div>
                        <div className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{c.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Filed on {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{c.studentId?.fullName}</div>
                        <div className="text-[11px] font-mono text-blue-600">{c.studentId?.enrollmentNo}</div>
                        <div className="text-[11px] text-slate-500">
                          {room ? `Room ${room.roomNumber} (${room.block})` : 'No Room'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{c.category}</div>
                        <span
                          className={`inline-block text-[10px] px-1.5 py-0.2 rounded mt-0.5 font-semibold ${
                            c.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : c.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.priority} Priority
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={c.status} />
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {c.resolutionRemarks ? (
                          <div className="text-slate-700 text-[11px] italic bg-slate-50 p-1.5 rounded border border-slate-100">
                            "{c.resolutionRemarks}"
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No remarks yet</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAction(c)}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition-colors font-medium text-[11px]"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Update</span>
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

      {/* Status Update Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Update Grievance: ${selectedComplaint?.title || ''}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full border border-slate-300 rounded p-2 bg-white"
            >
              <option value="Pending">Pending (Under review)</option>
              <option value="In Progress">In Progress (Maintenance team assigned)</option>
              <option value="Resolved">Resolved (Work completed)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resolution Remarks / Warden Note *
            </label>
            <textarea
              rows={3}
              required
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              placeholder="e.g. Electrician visited and repaired ballast wiring."
              className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setSelectedComplaint(null)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
