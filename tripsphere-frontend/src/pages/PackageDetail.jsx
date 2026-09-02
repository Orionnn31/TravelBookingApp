import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/NavigationBar';

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [timeInfo, setTimeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [numTravelers, setNumTravelers] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, timeRes] = await Promise.all([
          api.get(`/packages/${id}`),
          api.get(`/packages/${id}/time`),
        ]);

        if (pkgRes.data.success) setPkg(pkgRes.data.package);
        if (timeRes.data.success) setTimeInfo(timeRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingMsg('');
    setBookingLoading(true);

    try {
      const res = await api.post('/bookings', {
        package_id: Number(id),
        num_travelers: Number(numTravelers),
        travel_date: travelDate,
      });

      if (res.data.success) {
        setBookingMsg(`Booking created! Total: ₹${res.data.total_price}. Redirecting to your bookings...`);
        setTimeout(() => navigate('/my-bookings'), 1800);
      }
    } catch (err) {
      setBookingMsg(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <p className="text-slate-400 text-center mt-10">Loading...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <p className="text-red-400 text-center mt-10">{error || 'Package not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">{pkg.title}</h1>
        <p className="text-slate-400 mb-6">
          {pkg.destination_city}, {pkg.destination_country}
        </p>

        {timeInfo && (
          <div className="bg-slate-800 rounded-xl px-4 py-3 mb-6 inline-flex items-center gap-2">
            <span className="text-slate-400 text-sm">Local time in {timeInfo.destination_city}:</span>
            <span className="text-sky-400 font-semibold text-sm">
              {timeInfo.local_time} ({timeInfo.abbreviation})
            </span>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <p className="text-slate-300 mb-4">{pkg.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Price</p>
              <p className="text-white font-semibold">₹{Number(pkg.price).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-slate-500">Duration</p>
              <p className="text-white font-semibold">{pkg.duration_days} days</p>
            </div>
            <div>
              <p className="text-slate-500">Max Capacity</p>
              <p className="text-white font-semibold">{pkg.max_capacity} travelers</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Book this trip</h2>

          {bookingMsg && (
            <div className="bg-sky-500/20 text-sky-300 text-sm rounded-lg px-3 py-2 mb-4">
              {bookingMsg}
            </div>
          )}

          <form onSubmit={handleBooking}>
            <label className="block text-sm text-slate-300 mb-1">Number of travelers</label>
            <input
              type="number"
              min="1"
              max={pkg.max_capacity}
              value={numTravelers}
              onChange={(e) => setNumTravelers(e.target.value)}
              required
              className="w-full mb-4 px-3 py-2 rounded-lg bg-slate-700 text-white outline-none focus:ring-2 focus:ring-sky-500"
            />

            <label className="block text-sm text-slate-300 mb-1">Travel date</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              required
              className="w-full mb-6 px-3 py-2 rounded-lg bg-slate-700 text-white outline-none focus:ring-2 focus:ring-sky-500"
            />

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {bookingLoading ? 'Booking...' : 'Book Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}