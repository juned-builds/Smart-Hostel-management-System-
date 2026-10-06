import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Room } from '../models/Room.js';
import { Complaint } from '../models/Complaint.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Fee } from '../models/Fee.js';
import { Notice } from '../models/Notice.js';

export async function seedDatabase(force = false) {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0 && !force) {
    console.log(`[Seed] Database already contains records. Skipping seed.`);
    return;
  }

  console.log(`[Seed] Seeding realistic GTU Hostel Management demo records...`);

  if (force) {
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Room.deleteMany({}),
      Complaint.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Fee.deleteMany({}),
      Notice.deleteMany({}),
    ]);
  }

  // 1. Create Admins and Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const adminUser = await User.create({
    name: 'Prof. Ramesh Patel (Chief Warden)',
    email: 'admin@hostel.com',
    password: adminPassword,
    role: 'admin',
  });

  // Student accounts
  const rohanUser = await User.create({
    name: 'Rohan Mehta',
    email: 'student@hostel.com',
    password: studentPassword,
    role: 'student',
  });

  const priyaUser = await User.create({
    name: 'Priya Patel',
    email: 'priya@hostel.com',
    password: studentPassword,
    role: 'student',
  });

  const aaravUser = await User.create({
    name: 'Aarav Shah',
    email: 'aarav@hostel.com',
    password: studentPassword,
    role: 'student',
  });

  const ananyaUser = await User.create({
    name: 'Ananya Sharma',
    email: 'ananya@hostel.com',
    password: studentPassword,
    role: 'student',
  });

  const rohitUser = await User.create({
    name: 'Rohit Verma',
    email: 'rohit@hostel.com',
    password: studentPassword,
    role: 'student',
  });

  // 2. Create Rooms
  const roomA101 = await Room.create({
    roomNumber: 'A-101',
    block: 'Block A (Boys)',
    floor: 1,
    capacity: 2,
    occupied: 2,
    type: 'Standard',
    status: 'Full',
    monthlyRent: 4500,
  });

  const roomA102 = await Room.create({
    roomNumber: 'A-102',
    block: 'Block A (Boys)',
    floor: 1,
    capacity: 2,
    occupied: 0,
    type: 'Deluxe',
    status: 'Available',
    monthlyRent: 5500,
  });

  const roomB201 = await Room.create({
    roomNumber: 'B-201',
    block: 'Block B (Boys)',
    floor: 2,
    capacity: 3,
    occupied: 0,
    type: 'Standard',
    status: 'Available',
    monthlyRent: 4000,
  });

  const roomB202 = await Room.create({
    roomNumber: 'B-202',
    block: 'Block B (Girls)',
    floor: 2,
    capacity: 2,
    occupied: 2,
    type: 'AC',
    status: 'Full',
    monthlyRent: 6000,
  });

  const roomC301 = await Room.create({
    roomNumber: 'C-301',
    block: 'Block C (Boys)',
    floor: 3,
    capacity: 2,
    occupied: 0,
    type: 'Non-AC',
    status: 'Available',
    monthlyRent: 4200,
  });

  // 3. Create Student Profiles
  // Rohan & Aarav are in A-101
  const rohanStudent = await Student.create({
    userId: rohanUser._id,
    enrollmentNo: 'GTU2024BE01',
    fullName: 'Rohan Mehta',
    email: 'student@hostel.com',
    phone: '+91 98765 43210',
    department: 'Computer Engineering',
    semester: 5,
    gender: 'Male',
    guardianName: 'Dinesh Mehta',
    guardianPhone: '+91 98250 11223',
    address: 'B-44, Satellite Park, Ahmedabad, Gujarat',
    roomId: roomA101._id,
    bedNo: 'Bed 1',
    isActive: true,
  });

  const aaravStudent = await Student.create({
    userId: aaravUser._id,
    enrollmentNo: 'GTU2024BE03',
    fullName: 'Aarav Shah',
    email: 'aarav@hostel.com',
    phone: '+91 97234 56789',
    department: 'Computer Engineering',
    semester: 5,
    gender: 'Male',
    guardianName: 'Nirav Shah',
    guardianPhone: '+91 98980 44556',
    address: '12, Shanti Kunj, Vadodara, Gujarat',
    roomId: roomA101._id,
    bedNo: 'Bed 2',
    isActive: true,
  });

  // Priya & Ananya in B-202
  const priyaStudent = await Student.create({
    userId: priyaUser._id,
    enrollmentNo: 'GTU2024BE02',
    fullName: 'Priya Patel',
    email: 'priya@hostel.com',
    phone: '+91 98981 23456',
    department: 'Information Technology',
    semester: 5,
    gender: 'Female',
    guardianName: 'Hitesh Patel',
    guardianPhone: '+91 97120 77889',
    address: '501, Nilkanth Heights, Surat, Gujarat',
    roomId: roomB202._id,
    bedNo: 'Bed 1',
    isActive: true,
  });

  const ananyaStudent = await Student.create({
    userId: ananyaUser._id,
    enrollmentNo: 'GTU2024BE04',
    fullName: 'Ananya Sharma',
    email: 'ananya@hostel.com',
    phone: '+91 98112 34567',
    department: 'Electronics & Communication',
    semester: 5,
    gender: 'Female',
    guardianName: 'Sanjay Sharma',
    guardianPhone: '+91 98110 33445',
    address: 'Block-C, Lotus Residency, Gandhinagar, Gujarat',
    roomId: roomB202._id,
    bedNo: 'Bed 2',
    isActive: true,
  });

  // Rohit is unallocated (for demonstration of room allocation workflow)
  const rohitStudent = await Student.create({
    userId: rohitUser._id,
    enrollmentNo: 'GTU2024BE05',
    fullName: 'Rohit Verma',
    email: 'rohit@hostel.com',
    phone: '+91 96543 21098',
    department: 'Mechanical Engineering',
    semester: 5,
    gender: 'Male',
    guardianName: 'Manoj Verma',
    guardianPhone: '+91 94280 66778',
    address: 'Rajkot Highway Road, Morbi, Gujarat',
    roomId: null,
    bedNo: '',
    isActive: true,
  });

  // 4. Create Complaints
  await Complaint.create([
    {
      studentId: rohanStudent._id,
      title: 'Study Lamp & Tube Light Flickering',
      description: 'The primary ceiling tube light in room A-101 flickers continuously and requires replacement ballast or starter.',
      category: 'Electrical',
      priority: 'Medium',
      status: 'In Progress',
      resolutionRemarks: 'Electrician Mr. Mahesh assigned. Expected resolution by today evening.',
    },
    {
      studentId: rohanStudent._id,
      title: 'Bathroom Flush Valve Leakage',
      description: 'Minor water leakage from the flush cistern valve in bathroom A-101 causing water dripping.',
      category: 'Plumbing',
      priority: 'Low',
      status: 'Pending',
      resolutionRemarks: '',
    },
    {
      studentId: priyaStudent._id,
      title: 'Wi-Fi AP Signal Dropping in Block B 2nd Floor',
      description: 'Hostel Wi-Fi repeater speed drops below 1 Mbps during peak study hours (8 PM - 11 PM).',
      category: 'Wi-Fi/Internet',
      priority: 'High',
      status: 'Resolved',
      resolutionRemarks: 'Router firmware upgraded and channel 6 selected. Signal verified at 54 Mbps.',
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: aaravStudent._id,
      title: 'Broken Cupboard Lock Handle',
      description: 'Key gets stuck in the wardrobe lock drawer.',
      category: 'Carpentry',
      priority: 'Medium',
      status: 'Resolved',
      resolutionRemarks: 'Lock cylinder lubricated and replaced.',
      resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 5. Create Leave Requests
  await LeaveRequest.create([
    {
      studentId: rohanStudent._id,
      leaveType: 'Home Visit',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      reason: 'Visiting home for Diwali family celebrations and sister wedding preparations.',
      destinationAddress: 'B-44, Satellite Park, Ahmedabad',
      emergencyContact: '+91 98250 11223 (Father)',
      status: 'Approved',
      adminRemarks: 'Approved. Ensure to return and mark gate attendance by 7:00 PM Sunday.',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(),
    },
    {
      studentId: priyaStudent._id,
      leaveType: 'Academic/Event',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      reason: 'Attending Gujarat State Hackathon at GTU Chandkheda campus with faculty approval letter.',
      destinationAddress: 'GTU Chandkheda Campus, Ahmedabad',
      emergencyContact: '+91 97120 77889',
      status: 'Approved',
      adminRemarks: 'Approved for GTU Hackathon representation. Best wishes.',
      reviewedBy: adminUser._id,
      reviewedAt: new Date(),
    },
    {
      studentId: aaravStudent._id,
      leaveType: 'Home Visit',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      reason: 'Personal family religious function in hometown.',
      destinationAddress: '12, Shanti Kunj, Vadodara',
      emergencyContact: '+91 98980 44556',
      status: 'Pending',
      adminRemarks: '',
    },
  ]);

  // 6. Create Notices
  await Notice.create([
    {
      title: 'Hostel Semester 5 Mess & Maintenance Fee Deadline',
      content: 'All hostel residents are hereby notified that the hostel fee installment for Semester 5 (Odd Term 2024-25) must be cleared on or before the 25th of the month. Late fees of Rs. 50/day will be applicable thereafter.',
      category: 'Fee Deadline',
      priority: 'High Priority',
      postedBy: 'Chief Rector Office, GTU Hostel',
    },
    {
      title: 'Revised Dining Hall (Mess) Timings for Winter Term',
      content: 'Breakfast: 07:30 AM – 09:15 AM | Lunch: 12:15 PM – 02:00 PM | Evening Snacks: 05:00 PM – 06:00 PM | Dinner: 07:45 PM – 09:30 PM. Strict punctuality is requested to minimize food wastage.',
      category: 'Mess Notice',
      priority: 'Important',
      postedBy: 'Mess Committee / Rector',
    },
    {
      title: 'Hostel Night In-Time Discipline & Gate Entry Rules',
      content: 'Residents must be inside the hostel premises by 09:30 PM sharp on weekdays and 10:00 PM on Saturdays. Any leave without prior warden gate-pass approval will be treated as an unauthorized absence as per GTU code of conduct.',
      category: 'Rules & Regulations',
      priority: 'Important',
      postedBy: 'Warden Ramesh Patel',
    },
  ]);

  // 7. Create Fee Records
  await Fee.create([
    {
      studentId: rohanStudent._id,
      academicYear: '2024-2025',
      term: 'Semester 5 (Odd Term)',
      amount: 27000,
      paidAmount: 27000,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'Paid',
      paymentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      paymentMode: 'UPI',
      receiptNo: 'GTU-REC-892104',
      remarks: 'Full hostel room rent + mess deposit paid via SBI UPI.',
    },
    {
      studentId: priyaStudent._id,
      academicYear: '2024-2025',
      term: 'Semester 5 (Odd Term)',
      amount: 32000,
      paidAmount: 32000,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'Paid',
      paymentDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      paymentMode: 'Net Banking',
      receiptNo: 'GTU-REC-892105',
      remarks: 'AC Room fee installment received in full.',
    },
    {
      studentId: aaravStudent._id,
      academicYear: '2024-2025',
      term: 'Semester 5 (Odd Term)',
      amount: 27000,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Pending',
      remarks: 'Pending bank DD verification.',
    },
    {
      studentId: rohitStudent._id,
      academicYear: '2024-2025',
      term: 'Semester 5 (Odd Term)',
      amount: 25000,
      paidAmount: 0,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'Overdue',
      remarks: 'Reminder SMS and email sent to guardian.',
    },
  ]);

  console.log(`[Seed] Seed finished successfully! Demo accounts:`);
  console.log(`[Seed] Admin: admin@hostel.com / admin123`);
  console.log(`[Seed] Student: student@hostel.com / student123`);
}
