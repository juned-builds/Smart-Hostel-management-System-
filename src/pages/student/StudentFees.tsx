import React, { useEffect, useState } from 'react';
import { Receipt, CheckCircle, Clock, IndianRupee, Printer, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../../api/client.js';
import { FeeRecord } from '../../types/index.js';
import { Badge } from '../../components/Badge.js';
import { Modal } from '../../components/Modal.js';
import { useAuth } from '../../context/AuthContext.js';

export const StudentFees: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [selectedFeeToPay, setSelectedFeeToPay] = useState<FeeRecord | null>(null);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Receipt Modal
  const [viewingReceipt, setViewingReceipt] = useState<FeeRecord | null>(null);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees');
      if (res.data.success) {
        setFees(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeToPay) return;
    setSubmittingPayment(true);
    try {
      const res = await api.post(`/fees/${selectedFeeToPay._id}/pay`, { paymentMode });
      if (res.data.success) {
        setSelectedFeeToPay(null);
        fetchFees();
        // Automatically open the receipt!
        setViewingReceipt({ ...selectedFeeToPay, ...res.data.data, status: 'Paid' });
      }
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hostel Dues & University Payment Receipts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review semester hostel accommodation dues, mess deposits, and download authenticated fee receipts.
        </p>
      </div>

      {/* Fee List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading fee records...</div>
        ) : fees.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Dues Recorded</h3>
            <p className="text-xs text-slate-500 mt-1">There are no outstanding fee invoices for your account.</p>
          </div>
        ) : (
          fees.map((fee) => {
            const isPaid = fee.status === 'Paid';
            return (
              <div
                key={fee._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{fee.term}</span>
                    <Badge status={fee.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Academic Year {fee.academicYear} · Due by {new Date(fee.dueDate).toLocaleDateString()}
                  </p>
                  {fee.remarks && (
                    <p className="text-[11px] text-slate-600 mt-1 italic">{fee.remarks}</p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-left md:text-right">
                    <div className="text-xs text-slate-400 font-medium uppercase">Invoice Amount</div>
                    <div className="text-lg font-bold text-slate-900">₹{fee.amount.toLocaleString('en-IN')}</div>
                    {isPaid && (
                      <span className="text-[10px] text-emerald-600 block">
                        Receipt: {fee.receiptNo || 'GTU-REC'}
                      </span>
                    )}
                  </div>

                  {isPaid ? (
                    <button
                      onClick={() => setViewingReceipt(fee)}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-300"
                    >
                      <Receipt className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Receipt</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedFeeToPay(fee)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Online</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pay Online Simulated Modal */}
      <Modal
        isOpen={!!selectedFeeToPay}
        onClose={() => setSelectedFeeToPay(null)}
        title="Simulated Online Fee Payment Gateway"
      >
        <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-slate-600">Payable Term:</span>
            <span className="font-bold text-slate-900 block text-sm mt-0.5">{selectedFeeToPay?.term}</span>
            <div className="mt-2 flex items-baseline justify-between border-t border-blue-200/60 pt-2">
              <span className="text-slate-600">Total Due:</span>
              <span className="text-xl font-bold text-blue-900">
                ₹{selectedFeeToPay?.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Payment Method</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 bg-white"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Net Banking">Net Banking (SBI / HDFC / BOB)</option>
              <option value="Card">Debit / Credit Card</option>
            </select>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500">
            🔒 This is a simulated university payment workflow for the GTU academic project. Submitting will
            immediately record the transaction in MongoDB and generate an authenticated receipt.
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setSelectedFeeToPay(null)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPayment}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded disabled:opacity-50"
            >
              {submittingPayment ? 'Processing...' : 'Authorize & Pay ₹' + (selectedFeeToPay?.amount || 0)}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      <Modal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Gujarat Technological University · Fee Payment Receipt"
        maxWidth="max-w-xl"
      >
        {viewingReceipt && (
          <div id="printable-fee-receipt" className="space-y-4 text-xs font-sans">
            {/* Header branding */}
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Gujarat Technological University
              </h2>
              <p className="text-[11px] text-slate-500">Hostel Residence & Mess Administrative Division</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Chandkheda Campus, Ahmedabad - 382424</p>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
                Payment Status: Success (Paid)
              </div>
            </div>

            {/* Receipt metadata */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 block">Receipt Number:</span>
                <span className="font-mono font-bold text-slate-900">
                  {viewingReceipt.receiptNo || 'GTU-REC-892104'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Date:</span>
                <span className="font-bold text-slate-900">
                  {new Date(viewingReceipt.paymentDate || viewingReceipt.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Student Name:</span>
                <span className="font-bold text-slate-900">{user?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Enrollment No:</span>
                <span className="font-mono font-bold text-blue-600">
                  {user?.enrollmentNo || 'GTU2024BE01'}
                </span>
              </div>
            </div>

            {/* Fee Itemization */}
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2 border-b border-slate-200">Description</th>
                  <th className="p-2 border-b border-slate-200 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-medium">{viewingReceipt.term} Accommodation & Maintenance</td>
                  <td className="p-2 text-right">₹{viewingReceipt.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="p-2">Total Amount Paid</td>
                  <td className="p-2 text-right">₹{viewingReceipt.amount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-[10px] text-slate-400 text-center pt-2">
              This is a computer-generated university e-receipt for GTU BE 5th Sem WAD/ADBMS submission.
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2 no-print">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
