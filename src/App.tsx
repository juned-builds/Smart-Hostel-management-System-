import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Login } from './pages/Login.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { StudentManagement } from './pages/admin/StudentManagement.js';
import { RoomManagement } from './pages/admin/RoomManagement.js';
import { AllocationManagement } from './pages/admin/AllocationManagement.js';
import { ComplaintManagement } from './pages/admin/ComplaintManagement.js';
import { LeaveManagement } from './pages/admin/LeaveManagement.js';
import { FeeManagement } from './pages/admin/FeeManagement.js';
import { NoticeManagement } from './pages/admin/NoticeManagement.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { StudentProfile } from './pages/student/StudentProfile.js';
import { StudentRoom } from './pages/student/StudentRoom.js';
import { StudentComplaints } from './pages/student/StudentComplaints.js';
import { StudentLeaves } from './pages/student/StudentLeaves.js';
import { StudentFees } from './pages/student/StudentFees.js';
import { StudentNotices } from './pages/student/StudentNotices.js';

// Helper Root Redirect Component
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500">
        Loading hostel portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<DashboardLayout requiredRole="admin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="allocations" element={<AllocationManagement />} />
            <Route path="complaints" element={<ComplaintManagement />} />
            <Route path="leaves" element={<LeaveManagement />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="notices" element={<NoticeManagement />} />
          </Route>

          {/* Student Protected Routes */}
          <Route path="/student" element={<DashboardLayout requiredRole="student" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="room" element={<StudentRoom />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="leaves" element={<StudentLeaves />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="notices" element={<StudentNotices />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
