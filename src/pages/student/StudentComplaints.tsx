import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus, CheckCircle2, Clock, Wrench } from 'lucide-react';
import api from '../../api/client.js';
import { Complaint } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';
import { Modal } from '../../components/Modal.js';

export const StudentComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electrical',
    priority: 'Medium',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post('/complaints', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          category: 'Electrical',
          priority: 'Medium',
          description: '',
        });
        fetchComplaints();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit complaint ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hostel Maintenance & Grievance Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Report electrical, plumbing, carpentry, cleaning, or internet issues in your room.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge New Complaint</span>
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading grievance tickets...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Complaints Logged</h3>
            <p className="text-xs text-slate-500 mt-1">
              You currently have no open maintenance tickets. Click the button above to log an issue.
            </p>
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {c.category}
                    </span>
                    <Badge status={c.status} />
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        c.priority === 'High'
                          ? 'bg-rose-50 text-rose-700'
                          : c.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.priority} Priority
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Logged on {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2.5">{c.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
              </div>

              {/* Resolution Remarks Section */}
              {c.resolutionRemarks && (
                <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Warden / Maintenance Update:
                  </span>
                  <p className="text-xs text-slate-700 italic">"{c.resolutionRemarks}"</p>
                  {c.resolvedAt && (
                    <span className="text-[10px] text-emerald-600 mt-1 block font-medium">
                      Resolved on {new Date(c.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lodge Complaint Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lodge Maintenance Ticket">
        {formError && (
          <div className="mb-4 p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Fan Regulator Malfunctioning in Room"
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maintenance Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-slate-300 rounded p-2 bg-white"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Wi-Fi/Internet">Wi-Fi/Internet</option>
                <option value="Mess/Food">Mess/Food</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Urgency Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full border border-slate-300 rounded p-2 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Immediate attention)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide specific details so the technician can carry appropriate spare parts..."
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
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
