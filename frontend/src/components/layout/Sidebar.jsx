import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LayoutDashboard, BarChart2, Building2, RotateCw, LogOut } from 'lucide-react';

function Sidebar({ open }) {
  const location = useLocation();
  const { signOut, user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Revision', path: '/revision', icon: RotateCw },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`bg-dark-900 border-r border-dark-800 flex flex-col transition-all duration-300 ${
        open ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      {/* Logo */}
      <div className="h-14 border-b border-dark-800 flex items-center px-6">
        <h1 className="text-xl font-bold text-gradient">TufTracker</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange font-medium">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-dark-100 truncate">
              {user?.displayName}
            </div>
            <div className="text-xs text-dark-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="btn btn-ghost w-full text-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
