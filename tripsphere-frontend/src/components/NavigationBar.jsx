import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 px-6 py-4 flex items-center justify-between">
      <Link to="/packages" className="text-xl font-bold text-white">
        TripSphere
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/packages" className="text-slate-300 hover:text-white text-sm">
          Packages
        </Link>
        <Link to="/my-bookings" className="text-slate-300 hover:text-white text-sm">
          My Bookings
        </Link>
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Link to="/admin" className="text-slate-300 hover:text-white text-sm">
            Manage
          </Link>
        )}
        <span className="text-slate-400 text-sm">
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm px-3 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}