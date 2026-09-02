import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/NavigationBar';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/packages');
        if (res.data.success) {
          setPackages(res.data.packages);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Travel Packages</h1>

        {loading && <p className="text-slate-400">Loading packages...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              to={`/packages/${pkg.id}`}
              className="bg-slate-800 rounded-2xl p-5 hover:bg-slate-750 hover:scale-[1.02] transition shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-1">{pkg.title}</h2>
              <p className="text-slate-400 text-sm mb-3">
                {pkg.destination_city}, {pkg.destination_country}
              </p>
              <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                {pkg.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sky-400 font-bold">
                  ₹{Number(pkg.price).toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500 text-sm">
                  {pkg.duration_days} days
                </span>
              </div>
            </Link>
          ))}
        </div>

        {!loading && packages.length === 0 && (
          <p className="text-slate-400">No packages available right now.</p>
        )}
      </div>
    </div>
  );
}