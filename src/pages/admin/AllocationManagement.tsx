import React, { useEffect, useState } from 'react';
import { KeyRound, UserCheck, ShieldAlert, CheckCircle2, UserX, Building, AlertTriangle } from 'lucide-react';
import api from '../../api/client.js';
import { Student, Room } from '../../types/index.js';

export const AllocationManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [bedNo, setBedNo] = useState('Bed 1');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, roomsRes] = await Promise.all([
        api.get('/students?limit=100'),
        api.get('/rooms'),
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
      if (roomsRes.data.success) {
        setRooms(roomsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load allocation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unallocatedStudents = students.filter((s) => !s.roomId && s.isActive);
  const allocatedStudents = students.filter((s) => !!s.roomId && s.isActive);
  const availableRooms = rooms.filter((r) => r.status !== 'Maintenance' && r.occupied < r.capacity);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoomId) {
      setMessage({ text: 'Please select both a student and an available room.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post('/allocations', {
        studentId: selectedStudentId,
        roomId: selectedRoomId,
        bedNo,
      });

      if (res.data.success) {
        setMessage({ text: res.data.message || 'Room allocated successfully!', type: 'success' });
        setSelectedStudentId('');
        setSelectedRoomId('');
        fetchData();
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Allocation failed. Ensure capacity is not exceeded.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeallocate = async (student: Student) => {
    const room = student.roomId as any;
    if (
      !window.confirm(
        `Are you sure you want to deallocate ${student.fullName} from Room ${room?.roomNumber || ''}? This will free up the bed.`
      )
    ) {
      return;
    }

    try {
      const res = await api.post('/allocations/deallocate', {
        studentId: student._id,
      });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchData();
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Deallocation failed.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Room & Bed Allocation Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Assign students to vacant beds with automatic capacity validation and vacancy checks.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Allocation Action Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">New Room Allocation Workflow</h2>
        </div>

        <form onSubmit={handleAllocate} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
          {/* Select Unallocated Student */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Unallocated Student ({unallocatedStudents.length} waiting)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 bg-white focus:outline-hidden"
              required
            >
              <option value="">-- Choose Student --</option>
              {unallocatedStudents.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.fullName} ({st.enrollmentNo} · {st.department})
                </option>
              ))}
            </select>
          </div>

          {/* Select Available Room */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Available Room ({availableRooms.length} rooms with free beds)
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 bg-white focus:outline-hidden"
              required
            >
              <option value="">-- Choose Room --</option>
              {availableRooms.map((rm) => (
                <option key={rm._id} value={rm._id}>
                  Room {rm.roomNumber} ({rm.block} · {rm.capacity - rm.occupied} free bed
                  {rm.capacity - rm.occupied > 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Bed Identifier */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Bed Number / Label</label>
            <select
              value={bedNo}
              onChange={(e) => setBedNo(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 bg-white"
            >
              <option value="Bed 1">Bed 1</option>
              <option value="Bed 2">Bed 2</option>
              <option value="Bed 3">Bed 3</option>
              <option value="Bed 4">Bed 4</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting || unallocatedStudents.length === 0 || availableRooms.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-2 px-4 rounded transition-colors shadow-xs"
            >
              {submitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>

        {unallocatedStudents.length === 0 && (
          <p className="mt-3 text-[11px] text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
            ✓ All active students are currently allocated to rooms.
          </p>
        )}
      </div>

      {/* Active Allocations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Active Room Allocations ({allocatedStudents.length})
          </h2>
          <span className="text-xs text-slate-500">Enforces 1 active room per student</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Enrollment No</th>
                <th className="py-3 px-4">Branch & Semester</th>
                <th className="py-3 px-4">Allocated Room</th>
                <th className="py-3 px-4">Bed No</th>
                <th className="py-3 px-4">Hostel Block</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading allocations...
                  </td>
                </tr>
              ) : allocatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active room allocations found.
                  </td>
                </tr>
              ) : (
                allocatedStudents.map((st) => {
                  const rm = st.roomId as any;
                  return (
                    <tr key={st._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{st.fullName}</td>
                      <td className="py-3 px-4 font-mono text-blue-600 font-semibold">{st.enrollmentNo}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {st.department} (Sem {st.semester})
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          Room {rm?.roomNumber || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{st.bedNo || 'Bed 1'}</td>
                      <td className="py-3 px-4 text-slate-600">{rm?.block || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeallocate(st)}
                          className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded transition-colors font-medium text-[11px]"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Deallocate Bed</span>
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
    </div>
  );
};
