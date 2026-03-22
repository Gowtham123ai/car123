import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, getDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Booking, Car, Payment, Review, UserProfile } from '../types';
import { User, Calendar, Heart, Settings, ChevronRight, Clock, CheckCircle2, XCircle, CreditCard, Star, MessageSquare, Loader2, LifeBuoy, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Wishlist from './Wishlist';

export default function UserDashboard() {
  const [user] = useAuthState(auth);
  const location = useLocation();

  const menuItems = [
    { icon: User, label: 'Profile', path: '/dashboard' },
    { icon: Calendar, label: 'My Bookings', path: '/dashboard/bookings' },
    { icon: CreditCard, label: 'Payments', path: '/dashboard/payments' },
    { icon: Heart, label: 'Wishlist', path: '/dashboard/wishlist' },
    { icon: LifeBuoy, label: 'Emergency', path: '/dashboard/emergency' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center mb-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight line-clamp-1">{user?.displayName || 'User'}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Vel cars Member</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Routes>
            <Route path="/" element={<ProfileOverview />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/emergency" element={<EmergencySupport />} />
            <Route path="/settings" element={<div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center text-gray-400">Settings coming soon</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function ProfileOverview() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      };
      fetchProfile();
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Profile Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
            <p className="text-lg font-bold text-gray-900">{user?.displayName || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
            <p className="text-lg font-bold text-gray-900">{user?.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loyalty Points</p>
            <p className="text-lg font-bold text-indigo-600">{profile?.loyaltyPoints || 0} Points</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan</p>
            <p className="text-lg font-bold text-emerald-600">{profile?.subscriptionPlan || 'Free Plan'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencySupport() {
  const [user] = useAuthState(auth);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleEmergency = async () => {
    if (!user) return;
    setIsRequesting(true);
    try {
      await addDoc(collection(db, 'emergency_requests'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setRequestSent(true);
    } catch (error) {
      console.error("Emergency request failed:", error);
      alert("Failed to send emergency request. Please call support directly.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Emergency Support</h2>
        <p className="text-gray-500 font-medium mb-10 max-w-lg">
          Need immediate assistance? Click the button below to alert our support team or use our 24/7 hotline.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-red-200">
                <LifeBuoy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Alert</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Send SOS to Admin</p>

              {requestSent ? (
                <div className="bg-white px-6 py-3 rounded-xl border border-red-200 text-red-600 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>SOS Sent! Support is on the way.</span>
                </div>
              ) : (
                <button
                  onClick={handleEmergency}
                  disabled={isRequesting}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center space-x-2"
                >
                  {isRequesting ? <Loader2 className="h-6 w-6 animate-spin" /> : <span>SEND SOS SIGNAL</span>}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Support</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">24/7 Hotline</p>
                    <p className="text-lg font-bold text-gray-900">+1 (800) Vel cars</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email Support</p>
                    <p className="text-lg font-bold text-gray-900">sos@Vel cars.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyBookings() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState<(Booking & { car?: Car })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<(Booking & { car?: Car }) | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const bookingsData = await Promise.all(snap.docs.map(async (d) => {
        const booking = { id: d.id, ...d.data() } as any;
        const carSnap = await getDoc(doc(db, 'cars', booking.carId));
        return {
          ...booking,
          startDate: booking.startDate.toDate(),
          endDate: booking.endDate.toDate(),
          car: carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } as Car : undefined
        };
      }));
      setBookings(bookingsData);
      setLoading(false);
    };

    fetchBookings();
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center text-gray-400">No bookings found</div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={booking.car?.imageUrl || `https://picsum.photos/seed/${booking.car?.name}/200/200`} alt={booking.car?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{booking.car?.name || 'Unknown Car'}</h3>
                <p className="text-sm text-gray-500 font-medium">{format(booking.startDate, 'MMM d')} - {format(booking.endDate, 'MMM d, yyyy')}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 ${booking.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                    {booking.status === 'approved' ? <CheckCircle2 className="h-3 w-3" /> :
                      booking.status === 'pending' ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>{booking.status}</span>
                  </span>
                  <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900">₹{booking.totalPrice}</p>
              <div className="flex flex-col items-end gap-2 mt-2">
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View Receipt</button>
                {booking.status === 'completed' && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex items-center space-x-1 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <Star className="h-4 w-4" />
                    <span>Leave Review</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      <AnimatePresence>
        {selectedBooking && (
          <ReviewModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewModal({ booking, onClose }: { booking: Booking & { car?: Car }, onClose: () => void }) {
  const [user] = useAuthState(auth);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !booking.carId) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        carId: booking.carId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      alert('Review submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl"
      >
        <h3 className="text-2xl font-black text-gray-900 mb-2">Rate your experience</h3>
        <p className="text-gray-500 font-medium mb-8">How was your ride with the {booking.car?.name}?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={`h-10 w-10 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Review</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 font-medium focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
              placeholder="Tell us about your experience..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Submit Review</span>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PaymentHistory() {
  const [user] = useAuthState(auth);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      const paymentsData = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate() || new Date()
      } as Payment));
      setPayments(paymentsData);
      setLoading(false);
    };

    fetchPayments();
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl"></div>)}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Payment History</h2>
      {payments.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center text-gray-400">No payment history found</div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Method</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-900">{format(payment.timestamp, 'MMM d, yyyy')}</p>
                    <p className="text-xs text-gray-400 font-medium">{format(payment.timestamp, 'hh:mm a')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="font-bold text-gray-700 capitalize">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900">₹{payment.amount}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payment.status === 'captured' || payment.status === 'paid' || payment.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                        payment.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
