import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/store/authStore";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentShop from "@/pages/student/StudentShop";
import StudentOrders from "@/pages/student/StudentOrders";
import StudentLeaderboard from "@/pages/student/StudentLeaderboard";
import TeacherGroups from "@/pages/teacher/TeacherGroups";
import TeacherGroupDetail from "@/pages/teacher/TeacherGroupDetail";
import ManagerOrders from "@/pages/manager/ManagerOrders";
import ManagerInventory from "@/pages/manager/ManagerInventory";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminGroups from "@/pages/admin/AdminGroups";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient();

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const routes = { student: '/student/dashboard', teacher: '/teacher/groups', manager: '/manager/orders', admin: '/admin/users' };
  return <Navigate to={routes[user?.role || 'student']} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/shop" element={<ProtectedRoute allowedRoles={['student']}><StudentShop /></ProtectedRoute>} />
            <Route path="/student/orders" element={<ProtectedRoute allowedRoles={['student']}><StudentOrders /></ProtectedRoute>} />
            <Route path="/student/leaderboard" element={<ProtectedRoute allowedRoles={['student']}><StudentLeaderboard /></ProtectedRoute>} />
            <Route path="/teacher/groups" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherGroups /></ProtectedRoute>} />
            <Route path="/teacher/groups/:groupId" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherGroupDetail /></ProtectedRoute>} />
            <Route path="/manager/orders" element={<ProtectedRoute allowedRoles={['manager']}><ManagerOrders /></ProtectedRoute>} />
            <Route path="/manager/inventory" element={<ProtectedRoute allowedRoles={['manager']}><ManagerInventory /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/groups" element={<ProtectedRoute allowedRoles={['admin']}><AdminGroups /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
