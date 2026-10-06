import React, { useEffect, useState } from 'react';
import { Bell, Megaphone, Calendar, Tag, ShieldCheck } from 'lucide-react';
import api from '../../api/client.js';
import { Notice } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';

export const StudentNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hostel Notice Board & Official Circulars</h1>
        <p className="text-xs text-slate-500 mt-1">
          Stay informed about campus curfew timings, mess menus, fee deadlines, and college warden orders.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 text-xs">
        <label className="font-semibold text-slate-700">Filter Notices:</label>
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

      {/* Notice Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
            <Bell className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Circulars Published</h3>
            <p className="text-xs text-slate-500 mt-1">The hostel notice board has no announcements right now.</p>
          </div>
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
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Posted on {new Date(n.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2.5">{n.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Issuing Authority: {n.postedBy}</span>
                <span className="text-blue-600 font-medium">GTU Hostel Administration</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
