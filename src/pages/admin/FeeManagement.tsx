import React, { useEffect, useState } from 'react';
import { Receipt, Plus, CheckCircle, IndianRupee, Clock, AlertCircle, Search } from 'lucide-react';
import api from '../../api/client.js';
import { FeeRecord, Student } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';
import { Modal } from '../../components/Modal.js';

export const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    studentId: '',
    academicYear: '2024-2025',
    term: 'Semester 5 (Odd Term)',
    amount: 27000,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
    remarks: 'Hostel accommodation & mess deposit',
  });

  const [paymentData, setPaymentData] = useState({
    paymentMode: 'UPI',
    remarks: 'Payment verified by warden account.',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const [feesRes, studentsRes] = await Promise.all([
        api.get('/fees', { params }),
        api.get('/students?limit=100'),
      ]);

      if (feesRes.data.success) setFees(feesRes.data.data);
      if (studentsRes.data.success) setStudents(studentsRes.data.data);
    } catch (err) {
      console.error('Failed to load fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const totalExpected = fees.reduce((acc, f) => acc + f.amount, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPending = totalExpected - totalCollected;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return;
    setSubmitting(true);
    try {
      const res = await api.post('/fees', formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        fetchFees();
      }
    } catch (err) {
      console.error('Failed to create fee:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/fees/${selectedFee._id}`, {
        status: 'Paid',
        paidAmount: selectedFee.amount,
        paymentMode: paymentData.paymentMode,
        remarks: paymentData.remarks,
      });
      if (res.data.success) {
        setSelectedFee(null);
        fetchFees();
      }
    } catch (err) {
      console.error('Failed to update fee:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hostel Fee & Payment Reconciliation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student semester fee demands, mess bills, online UPI payments, and generate university receipts.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Fee Demand</span>
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Fee Demanded</p>
            <p className="text-lg font-bold text-slate-900">₹{totalExpected.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Fee Collected</p>
            <p className="text-lg font-bold text-emerald-600">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Outstanding</p>
            <p className="text-lg font-bold text-amber-600">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 text-xs">
        <label className="font-semibold text-slate-700">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-hidden"
        >
          <option value="All">All Invoices</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Student & Enrollment</th>
                <th className="py-3 px-4">Academic Term</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status & Receipt</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading fee records...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                fees.map((f) => {
                  const s = f.studentId;
                  const isPaid = f.status === 'Paid';
                  return (
                    <tr key={f._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s?.fullName}</div>
                        <div className="text-[11px] font-mono text-blue-600">{s?.enrollmentNo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{f.term}</div>
                        <div className="text-slate-500 text-[11px]">{f.academicYear}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{f.amount.toLocaleString('en-IN')}
                        {isPaid && (
                          <div className="text-[10px] text-emerald-600 font-normal">
                            Paid on {new Date(f.paymentDate || f.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(f.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={f.status} />
                        {f.receiptNo && (
                          <div className="text-[10px] font-mono text-slate-500 mt-1">
                            Receipt: {f.receiptNo}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isPaid && (
                          <button
                            onClick={() => setSelectedFee(f)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px]"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Fee Invoice Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Generate Hostel Fee Demand">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full border border-slate-300 rounded p-2 bg-white"
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.fullName} ({st.enrollmentNo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term / Semester</label>
              <input
                type="text"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fee Amount (₹) *</label>
              <input
                type="number"
                required
                min="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fee Description / Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
              {submitting ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal
        isOpen={!!selectedFee}
        onClose={() => setSelectedFee(null)}
        title={`Record Payment for ${selectedFee?.studentId?.fullName || ''}`}
      >
        <form onSubmit={handleMarkPaid} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-slate-600">Total Demanded Amount:</p>
            <p className="text-xl font-bold text-slate-900 mt-1">₹{selectedFee?.amount.toLocaleString('en-IN')}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
            <select
              value={paymentData.paymentMode}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
              className="w-full border border-slate-300 rounded p-2 bg-white"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Net Banking">Net Banking (SBI / HDFC / BOB)</option>
              <option value="Cash">Cash (College Accounts Office Counter)</option>
              <option value="Demand Draft">Demand Draft (DD)</option>
              <option value="Card">Debit / Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Verification Note</label>
            <input
              type="text"
              value={paymentData.remarks}
              onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setSelectedFee(null)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Verify & Generate Receipt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
