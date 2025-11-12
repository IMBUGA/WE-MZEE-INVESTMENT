import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Contributions from './pages/Contributions';
import Investments from './pages/Investments';
import Loans from './pages/Loans';
import Profits from './pages/Profits';
import Members from './pages/Members';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  const adminRoles = ['admin', 'treasurer', 'secretary'];
  return user && adminRoles.includes(user.role) ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contributions" element={<Contributions />} />
            <Route path="investments" element={<Investments />} />
            <Route path="loans" element={<Loans />} />
            <Route path="profits" element={<Profits />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports" element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            } />
            <Route path="notifications" element={
              <AdminRoute>
                <Notifications />
              </AdminRoute>
            } />
            <Route path="members" element={
              <AdminRoute>
                <Members />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;