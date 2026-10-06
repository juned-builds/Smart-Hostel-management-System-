import React, { useEffect, useState } from 'react';
import { BedDouble, Plus, Edit2, Trash2, Users, Building, ShieldAlert } from 'lucide-react';
import api from '../../api/client.js';
import { Room } from '../../types/index.js';
import { Modal } from '../../components/Modal.js';
import { Badge } from '../../components/Badge.js';

export const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockFilter, setBlockFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form
  const [formData, setFormData] = useState({
    roomNumber: '',
    block: 'Block A (Boys)',
    floor: 1,
    capacity: 2,
    type: 'Standard',
    monthlyRent: 4500,
    status: 'Available',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (blockFilter !== 'All') params.block = blockFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/rooms', { params });
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [blockFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      roomNumber: '',
      block: 'Block A (Boys)',
      floor: 1,
      capacity: 2,
      type: 'Standard',
      monthlyRent: 4500,
      status: 'Available',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      capacity: room.capacity,
      type: room.type,
      monthlyRent: room.monthlyRent,
      status: room.status,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post('/rooms', formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        fetchRooms();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.put(`/rooms/${selectedRoom._id}`, formData);
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchRooms();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update room.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (room.occupied > 0) {
      alert(`Cannot delete room ${room.roomNumber}: ${room.occupied} student(s) currently allocated. Please deallocate students first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete room "${room.roomNumber}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/rooms/${room._id}`);
      if (res.data.success) {
        fetchRooms();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hostel Room Inventory & Capacity</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track capacity, active occupants, maintenance status, and bed vacancies across all blocks.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="font-semibold text-slate-700 mr-2">Hostel Block:</label>
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-hidden"
          >
            <option value="All">All Blocks</option>
            <option value="Block A (Boys)">Block A (Boys)</option>
            <option value="Block B (Boys)">Block B (Boys)</option>
            <option value="Block B (Girls)">Block B (Girls)</option>
            <option value="Block C (Boys)">Block C (Boys)</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 mr-2">Availability Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available (Has Vacant Beds)</option>
            <option value="Full">Full (No Beds)</option>
            <option value="Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
            Loading room inventories...
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
            No rooms found matching current filters.
          </div>
        ) : (
          rooms.map((room) => {
            const isFull = room.occupied >= room.capacity;
            const occupancyPct = Math.round((room.occupied / room.capacity) * 100);

            return (
              <div
                key={room._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <span>Room {room.roomNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {room.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {room.block} · Floor {room.floor}
                      </p>
                    </div>
                    <Badge status={room.status} />
                  </div>

                  {/* Occupancy Indicator */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Bed Capacity</span>
                      <span className="font-bold text-slate-800">
                        {room.occupied} / {room.capacity} Beds
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-right font-medium text-slate-500">
                      {room.availableBeds} bed{room.availableBeds === 1 ? '' : 's'} vacant · ₹{room.monthlyRent}/month
                    </div>
                  </div>

                  {/* Active Occupants List */}
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Current Occupants ({room.occupants?.length || 0})</span>
                    </p>
                    {room.occupants && room.occupants.length > 0 ? (
                      <ul className="space-y-1.5 text-xs">
                        {room.occupants.map((occ) => (
                          <li
                            key={occ._id}
                            className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100"
                          >
                            <div>
                              <span className="font-semibold text-slate-800">{occ.fullName}</span>
                              <span className="text-[10px] text-blue-600 block">{occ.enrollmentNo}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{occ.phone}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">Room is currently empty.</p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                    title="Edit Room"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Hostel Room">
        {formError && (
          <div className="mb-4 p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. A-103"
                className="w-full border border-slate-300 rounded p-2 uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Block *</label>
              <select
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              >
                <option value="Block A (Boys)">Block A (Boys)</option>
                <option value="Block B (Boys)">Block B (Boys)</option>
                <option value="Block B (Girls)">Block B (Girls)</option>
                <option value="Block C (Boys)">Block C (Boys)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor Number</label>
              <input
                type="number"
                min="0"
                max="5"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bed Capacity *</label>
              <input
                type="number"
                min="1"
                max="4"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
            <input
              type="number"
              min="1000"
              step="500"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
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
              {submitting ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Room Configuration">
        {formError && (
          <div className="mb-4 p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hostel Block</label>
              <input
                type="text"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bed Capacity</label>
              <input
                type="number"
                min={selectedRoom?.occupied || 1}
                max="4"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded p-2"
              />
              <span className="text-[10px] text-slate-400">
                Cannot be lower than current occupants ({selectedRoom?.occupied || 0}).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              >
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
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
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
