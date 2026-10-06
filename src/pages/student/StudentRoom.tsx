import React, { useEffect, useState } from 'react';
import { BedDouble, Users, Phone, Mail, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';

export const StudentRoom: React.FC = () => {
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoomDetails() {
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data.success && meRes.data.user.student?._id) {
          const studentId = meRes.data.user.student._id;
          const studentRes = await api.get(`/students/${studentId}`);
          if (studentRes.data.success) {
            setRoomData(studentRes.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoomDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-500 text-xs">Loading room & roommate details...</div>
      </div>
    );
  }

  const room = roomData?.student?.roomId;
  const currentStudent = roomData?.student;
  const roommates = roomData?.roommates || [];

  if (!room) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-xs">
        <BedDouble className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">No Room Allotted</h2>
        <p className="text-xs text-slate-500 mt-2">
          You are currently in the unallocated pool. Once the hostel warden reviews and assigns you a vacant bed, room details and roommates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Room Details & Roommates</h1>
        <p className="text-xs text-slate-500 mt-1">
          Residential room configuration, fellow room occupants, and hostel amenities.
        </p>
      </div>

      {/* Room Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">Room {room.roomNumber}</h2>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                  {room.type} Room
                </span>
              </div>
              <p className="text-xs text-slate-500">{room.block} · Floor {room.floor}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">Bed Allocation</span>
            <span className="font-bold text-sm text-slate-900">{currentStudent?.bedNo || 'Bed 1'}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Room Capacity</span>
            <span className="font-semibold text-slate-800">{room.capacity} Beds</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Current Occupants</span>
            <span className="font-semibold text-slate-800">{room.occupied} Resident(s)</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Monthly Tariff</span>
            <span className="font-semibold text-slate-800">₹{room.monthlyRent} / month</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Room Status</span>
            <span className="font-semibold text-emerald-600">Active Occupancy</span>
          </div>
        </div>
      </div>

      {/* Roommates Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Roommates in Room {room.roomNumber}</h3>
        </div>

        <div className="mt-4">
          {roommates.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No other roommates currently sharing this room. Vacant beds available.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roommates.map((rm: any) => (
                <div
                  key={rm._id}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{rm.fullName}</span>
                    <span className="font-mono text-[11px] text-blue-600 font-semibold">{rm.enrollmentNo}</span>
                  </div>

                  <div className="text-slate-600">
                    <div>{rm.department}</div>
                    <div className="text-slate-500">Semester {rm.semester}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-700">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rm.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Room Amenities & Guidelines */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Room Inventory & Amenities</span>
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Wooden Study Table & Chair per resident</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Steel Wardrobe / Almirah with locking latch</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>High-Speed Campus Wi-Fi Internet Access</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>24x7 Water Supply and RO Drinking Water Station</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
