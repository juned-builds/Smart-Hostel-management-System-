import React, { useEffect, useState } from 'react';
import { Bell, Plus, Edit2, Trash2, Megaphone, AlertTriangle, FileText } from 'lucide-react';
import api from '../../api/client.js';
import { Notice } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';
import { Modal } from '../../components/Modal.js';

export const NoticeManagement: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    postedBy: 'Chief Rector / Warden',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const res = await api.get('/notices', { params });
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      content: '',
      category: 'General',
      priority: 'Normal',
      postedBy: 'Chief Rector / Warden',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (n: Notice) => {
    setSelectedNotice(n);
    setFormData({
      title: n.title,
      content: n.content,
      category: n.category,
      priority: n.priority,
      postedBy: n.postedBy,
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/notices', formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        fetchNotices();
      }
    } catch (err) {
      console.error('Failed to publish notice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/notices/${selectedNotice._id}`, formData);
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchNotices();
      }
    } catch (err) {
      console.error('Failed to update notice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notice circular from hostel board?')) return;
    try {
      const res = await api.delete(`/notices/${id}`);
      if (res.data.success) {
        fetchNotices();
      }
    } catch (err) {
      console.error('Failed to delete notice:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hostel Circular & Notice Board Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish official announcements, mess schedules, fee deadlines, and hostel code of conduct.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 text-xs">
        <label className="font-semibold text-slate-700">Filter by Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-hidden"
        >
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="Rules & Regulations">Rules & Regulations</option>
          <option value="Fee Deadline">Fee Deadline</option>
          <option value="Mess Notice">Mess Notice</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Notice List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No notices on the board.</div>
        ) : (
          notices.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {n.category}
                    </span>
                    <Badge status={n.priority} />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Posted on {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{n.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">By: {n.postedBy}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(n)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    title="Edit Notice"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Notice Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Publish Official Hostel Notice">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mandatory Hostel Floor Cleaning Schedule"
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-slate-300 rounded p-2 bg-white"
              >
                <option value="General">General</option>
                <option value="Rules & Regulations">Rules & Regulations</option>
                <option value="Fee Deadline">Fee Deadline</option>
                <option value="Mess Notice">Mess Notice</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full border border-slate-300 rounded p-2 bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="High Priority">High Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Description / Content *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Full details of notice circular..."
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issuing Authority / Signatory</label>
            <input
              type="text"
              value={formData.postedBy}
              onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish to Board'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Notice Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Notice">
        <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-slate-300 rounded p-2 bg-white"
              >
                <option value="General">General</option>
                <option value="Rules & Regulations">Rules & Regulations</option>
                <option value="Fee Deadline">Fee Deadline</option>
                <option value="Mess Notice">Mess Notice</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full border border-slate-300 rounded p-2 bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="High Priority">High Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Description / Content</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
