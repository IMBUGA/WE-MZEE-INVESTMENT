import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  CreditCard,   // Loans icon
  PieChart,
  Users,
  Menu,
  X,
  LogOut,
  User,
  FileText,
  Bell
} from 'lucide-react';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contributions', href: '/contributions', icon: DollarSign },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
    { name: 'Loans', href: '/loans', icon: CreditCard },
    { name: 'Profits', href: '/profits', icon: PieChart },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  if (user?.role !== 'member') {
    navigation.push(
      { name: 'Members', href: '/members', icon: Users },
      { name: 'Reports', href: '/reports', icon: FileText },
      { name: 'Notifications', href: '/notifications', icon: Bell }
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <item.icon className="h-5 w-5 mr-3" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold">WE MZEE</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-8 w-8 p-1 bg-gray-100 rounded-full" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold">WE MZEE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;
