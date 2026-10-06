import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, MapPin, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';
import { LeaveRequest } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';
import { Modal } from '../../components/Modal.js';

export const StudentLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Home Visit',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: '',
    destinationAddress: '',
    emergencyContact: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post('/leaves', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          leaveType: 'Home Visit',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reason: '',
          destinationAddress: '',
          emergencyContact: '',
        });
        fetchLeaves();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to apply for leave.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hostel Leave & Out-Pass Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply for home visits, medical leave, or academic events. Requires warden approval before gate exit.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Out-Pass</span>
        </button>
      </div>

      {/* Leaves List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
            <CalendarDays className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Leave Applications</h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven't submitted any out-pass requests yet. Click above to submit a new leave application.
            </p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {leave.leaveType}
                    </span>
                    <Badge status={leave.status} />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Applied on {new Date(leave.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs font-semibold text-slate-900">
                  <span>From: {new Date(leave.startDate).toLocaleDateString()}</span>
                  <span>To: {new Date(leave.endDate).toLocaleDateString()}</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  <strong className="text-slate-700">Reason:</strong> {leave.reason}
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Destination: {leave.destinationAddress || 'Home Town'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Emergency Contact: {leave.emergencyContact || 'Guardian Phone'}</span>
                  </div>
                </div>
              </div>

              {/* Admin Remarks */}
              {leave.adminRemarks && (
                <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Warden Decision Note:
                  </span>
                  <p className="text-xs text-slate-700 italic">"{leave.adminRemarks}"</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Out-Pass / Leave">
        {formError && (
          <div className="mb-4 p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
              className="w-full border border-slate-300 rounded p-2 bg-white"
            >
              <option value="Home Visit">Home Visit</option>
              <option value="Medical">Medical Treatment</option>
              <option value="Academic/Event">Academic / University Event</option>
              <option value="Emergency">Family Emergency</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Departure Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Return Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea
              rows={2}
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Attending sister's wedding / Diwali holidays with family"
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Destination Address *</label>
            <input
              type="text"
              required
              value={formData.destinationAddress}
              onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
              placeholder="City / Home address where you will be staying"
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Emergency Mobile Contact *</label>
            <input
              type="text"
              required
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Parent or local guardian contact number"
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
