import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/NavigationBar';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  confirmed: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      if (res.data.success) setBookings(res.data.bookings);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    setActionMsg('');
    try {
      const res = await api.put(`/bookings/${id}/cancel`);
      if (res.data.success) {
        setActionMsg('Booking cancelled.');
        fetchBookings();
      }
    } catch (err) {
      setActionMsg(err.response?.data?.error || 'Cancel failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My Bookings</h1>

        {loading && <p className="text-slate-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {actionMsg && (
          <div className="bg-sky-500/20 text-sky-300 text-sm rounded-lg px-3 py-2 mb-4 inline-block">
            {actionMsg}
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">{b.title}</h2>
                <p className="text-slate-400 text-sm">
                  {b.destination_city}, {b.destination_country}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {b.num_travelers} traveler{b.num_travelers > 1 ? 's' : ''} - Travel date:{' '}
                  {new Date(b.travel_date).toLocaleDateString()}
                </p>
                <p className="text-sky-400 font-semibold mt-1">
                  ₹ {Number(b.total_price).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="text-right space-y-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                  {b.status}
                </span>
                <div className="flex flex-col gap-2 mt-2">
                  {b.status === 'pending' && (
                    <>
                      <Link
                        to={`/pay/${b.id}`}
                        className="bg-sky-500 hover:bg-sky-600 text-white text-sm px-3 py-1.5 rounded-lg transition text-center"
                      >
                        Pay Now
                      </Link>
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm px-3 py-1.5 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && bookings.length === 0 && (
          <p className="text-slate-400">You have not booked any trips yet.</p>
        )}
      </div>
    </div>
  );
}