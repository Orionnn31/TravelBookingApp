import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Packages from './pages/Packages';
import ProtectedRoute from './components/ProtectedRoute';
import PackageDetail from './pages/PackageDetail';
import MyBookings from './pages/MyBookings';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/packages"
        element={
          <ProtectedRoute>
            <Packages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/packages/:id"
        element={
          <ProtectedRoute>
            <PackageDetail />
          </ProtectedRoute>
        }
        />
        <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
  path="/pay/:id"
  element={
    <ProtectedRoute>
      <Payment />
    </ProtectedRoute>
  }
/>
      <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['agent', 'admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default App;