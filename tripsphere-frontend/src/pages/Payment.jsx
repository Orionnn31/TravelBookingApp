import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/NavigationBar';

export default function Payment() {
  const { id } = useParams(); // booking id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [message, setMessage] = useState('');

  const startPayment = async () => {
    setStatus('processing');
    setMessage('');

    try {
      const orderRes = await api.post('/payments/create-order', { booking_id: Number(id) });

      if (!orderRes.data.success) {
        setStatus('error');
        setMessage(orderRes.data.error || 'Could not create order');
        return;
      }

      const { order_id, amount, currency, key_id } = orderRes.data;

      const options = {
        key: key_id,
        amount,
        currency,
        name: 'TripSphere',
        description: 'Booking Payment (TEST MODE)',
        order_id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: Number(id),
              payment_method: 'card',
            });

            if (verifyRes.data.success) {
              setStatus('success');
              setMessage('Payment successful! Your booking is confirmed.');
              setTimeout(() => navigate('/my-bookings'), 2000);
            } else {
              setStatus('error');
              setMessage(verifyRes.data.error || 'Verification failed');
            }
          } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'Verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            setStatus('idle');
            setMessage('Payment cancelled.');
          },
        },
        theme: { color: '#0ea5e9' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setStatus('error');
        setMessage('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Could not start payment');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Complete Payment</h1>
        <p className="text-slate-400 mb-8">Booking #{id}</p>

        {message && (
          <div
            className={`text-sm rounded-lg px-3 py-2 mb-6 ${
              status === 'success'
                ? 'bg-green-500/20 text-green-300'
                : status === 'error'
                ? 'bg-red-500/20 text-red-300'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={startPayment}
          disabled={status === 'processing' || status === 'success'}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {status === 'processing' ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-slate-500 text-xs mt-6">
          Test mode — use card 4111 1111 1111 1111, any future expiry, any CVV.
        </p>
      </div>
    </div>
  );
}