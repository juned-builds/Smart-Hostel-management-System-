export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  studentId?: string | null;
  enrollmentNo?: string | null;
}

export interface RoomOccupant {
  _id: string;
  fullName: string;
  enrollmentNo: string;
  phone: string;
  department: string;
  semester: number;
  email?: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  block: string;
  floor: number;
  capacity: number;
  occupied: number;
  type: 'Standard' | 'Deluxe' | 'AC' | 'Non-AC';
  status: 'Available' | 'Full' | 'Maintenance';
  monthlyRent: number;
  availableBeds?: number;
  occupants?: RoomOccupant[];
  createdAt: string;
}

export interface Student {
  _id: string;
  userId: string;
  enrollmentNo: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  semester: number;
  gender: 'Male' | 'Female' | 'Other';
  guardianName: string;
  guardianPhone: string;
  address: string;
  roomId: Room | string | null;
  bedNo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    enrollmentNo: string;
    phone: string;
    department?: string;
    roomId?: {
      _id: string;
      roomNumber: string;
      block: string;
    };
  };
  title: string;
  description: string;
  category: 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleaning' | 'Wi-Fi/Internet' | 'Mess/Food' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  resolutionRemarks: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface LeaveRequest {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    enrollmentNo: string;
    phone: string;
    department?: string;
    roomId?: {
      _id: string;
      roomNumber: string;
      block: string;
    };
  };
  leaveType: 'Home Visit' | 'Medical' | 'Academic/Event' | 'Emergency' | 'Other';
  startDate: string;
  endDate: string;
  reason: string;
  destinationAddress: string;
  emergencyContact: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface FeeRecord {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    enrollmentNo: string;
    phone: string;
    department?: string;
    semester?: number;
    roomId?: {
      _id: string;
      roomNumber: string;
      block: string;
    };
  };
  academicYear: string;
  term: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
  paymentDate?: string;
  paymentMode?: string;
  receiptNo?: string;
  remarks?: string;
  createdAt: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Rules & Regulations' | 'Fee Deadline' | 'Mess Notice' | 'Urgent';
  priority: 'Normal' | 'Important' | 'High Priority';
  postedBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  students: {
    total: number;
    active: number;
    allocated: number;
    unallocated: number;
  };
  rooms: {
    totalRooms: number;
    totalCapacity: number;
    totalOccupied: number;
    availableBeds: number;
    occupancyRate: number;
  };
  roomsByBlock: Array<{
    _id: string;
    rooms: number;
    capacity: number;
    occupied: number;
  }>;
  complaints: {
    total: number;
    byStatus: {
      Pending: number;
      'In Progress': number;
      Resolved: number;
      Rejected: number;
    };
    byCategory: Array<{ _id: string; count: number }>;
  };
  leaves: {
    total: number;
    byStatus: {
      Pending: number;
      Approved: number;
      Rejected: number;
    };
  };
  fees: {
    totalExpected: number;
    totalCollected: number;
    pendingAmount: number;
    pendingRecords: number;
    paidRecords: number;
    byStatus: Array<{ _id: string; count: number; totalAmount: number; totalPaid: number }>;
  };
  recent: {
    complaints: any[];
    leaves: any[];
    notices: Notice[];
  };
}
