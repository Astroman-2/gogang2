import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  LogOut,
  Heart
} from 'lucide-react';
import { useLogout, useCurrentUser } from '../../hooks/useAuth';

const Sidebar = () => {
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  const navItems = [
    { to: '/patients', icon: Users, label: 'Patients' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/billing', icon: DollarSign, label: 'Billing' },
    { to: '/reports/schedule', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="bg-primary-900 text-white w-64 min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-primary-300" />
        <div>
          <h1 className="text-xl font-bold">HealthApp</h1>
          <p className="text-xs text-primary-300">EMR & RCM</p>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="mb-6 p-3 bg-primary-800 rounded-lg">
          <p className="text-sm font-medium">{user.full_name}</p>
          <p className="text-xs text-primary-300">{user.role}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-200 hover:bg-primary-800 transition-colors w-full"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
