import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/NavigationBar';

const emptyForm = {
  title: '', description: '', destination_city: '', destination_country: '',
  timezone_id: '', price: '', duration_days: '', max_capacity: '', image_url: '',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('packages');

  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchPackages = async () => {
    const res = await api.get('/packages');
    if (res.data.success) setPackages(res.data.packages);
  };

  const fetchBookings = async () => {
    const res = await api.get('/bookings');
    if (res.data.success) setBookings(res.data.bookings);
  };

  useEffect(() => {
    fetchPackages();
    fetchBookings();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editingId) {
        await api.put(`/packages/${editingId}`, form);
        setMsg('Package updated.');
      } else {
        await api.post('/packages', form);
        setMsg('Package created.');
      }
      resetForm();
      fetchPackages();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Action failed');
    }
  };

  const handleEdit = (pkg) => {
    setForm({
      title: pkg.title, description: pkg.description || '',
      destination_city: pkg.destination_city, destination_country: pkg.destination_country,
      timezone_id: pkg.timezone_id, price: pkg.price, duration_days: pkg.duration_days,
      max_capacity: pkg.max_capacity, image_url: pkg.image_url || '',
    });
    setEditingId(pkg.id);
    setTab('form');
  };

  const handleDelete = async (id) => {
    if (user.role !== 'admin') return;
    setMsg('');
    try {
      await api.delete(`/packages/${id}`);
      setMsg('Package deleted.');
      fetchPackages();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    setMsg('');
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Status update failed');
    }
  };

  const inputClass = "w-full mb-3 px-3 py-2 rounded-lg bg-slate-700 text-white outline-none focus:ring-2 focus:ring-sky-500";

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Manage TripSphere</h1>

        <div className="flex gap-2 mb-6">
          {['packages', 'form', 'bookings'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === 'form' && !editingId) resetForm(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tab === t ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {t === 'packages' ? 'All Packages' : t === 'form' ? (editingId ? 'Edit Package' : 'New Package') : 'All Bookings'}
            </button>
          ))}
        </div>

        {msg && (
          <div className="bg-sky-500/20 text-sky-300 text-sm rounded-lg px-3 py-2 mb-4 inline-block">
            {msg}
          </div>
        )}

        {tab === 'packages' && (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold">{pkg.title}</h3>
                  <p className="text-slate-400 text-sm">
                    {pkg.destination_city}, {pkg.destination_country} - Rs {Number(pkg.price).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="bg-slate-700 text-slate-200 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="bg-red-500/20 text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'form' && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-6 max-w-lg">
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className={inputClass} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className={inputClass} />
            <input name="destination_city" placeholder="Destination City" value={form.destination_city} onChange={handleChange} required className={inputClass} />
            <input name="destination_country" placeholder="Destination Country" value={form.destination_country} onChange={handleChange} required className={inputClass} />
            <input name="timezone_id" placeholder="Timezone ID (e.g. Asia/Tokyo)" value={form.timezone_id} onChange={handleChange} required className={inputClass} />
            <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required className={inputClass} />
            <input name="duration_days" type="number" placeholder="Duration (days)" value={form.duration_days} onChange={handleChange} required className={inputClass} />
            <input name="max_capacity" type="number" placeholder="Max Capacity" value={form.max_capacity} onChange={handleChange} required className={inputClass} />
            <input name="image_url" placeholder="Image URL (optional)" value={form.image_url} onChange={handleChange} className={inputClass} />

            <div className="flex gap-2">
              <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">
                {editingId ? 'Update Package' : 'Create Package'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-slate-700 text-slate-300 py-2 px-4 rounded-lg">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        {tab === 'bookings' && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold">{b.package_title}</h3>
                  <p className="text-slate-400 text-sm">
                    {b.customer_name} ({b.customer_email}) - {b.num_travelers} travelers - Rs {Number(b.total_price).toLocaleString('en-IN')}
                  </p>
                </div>
                <select
                  value={b.status}
                  onChange={(e) => handleStatusChange(b.id, e.target.value)}
                  className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded-lg outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-slate-400">No bookings yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}