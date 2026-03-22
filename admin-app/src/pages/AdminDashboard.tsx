import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { Car, Coupon } from '../types';
import { LayoutDashboard, Car as CarIcon, Calendar, Users, Settings, Plus, Edit, Trash2, TrendingUp, DollarSign, Activity, LifeBuoy, Ticket, Check, X, Bell, CheckCircle2 } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AdminDashboard() {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: CarIcon, label: 'Fleet', path: '/fleet' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: Ticket, label: 'Coupons', path: '/coupons' },
    { icon: LifeBuoy, label: 'SOS', path: '/emergency' },
    { icon: Users, label: 'Customers', path: '/customers' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-2">
          <div className="mb-8 px-4 flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Admin Panel</h2>
          </div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all font-bold ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-4">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/fleet" element={<FleetManagement />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/coupons" element={<CouponManagement />} />
            <Route path="/emergency" element={<EmergencyManagement />} />
            <Route path="/customers" element={<div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center text-gray-400">Customer management coming soon</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, active: 0, customers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const bookings = bookingsSnap.docs.map(d => d.data());
      const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const activeRentals = bookings.filter(b => b.status === 'approved').length;
      
      const usersSnap = await getDocs(collection(db, 'users'));

      setStats({
        revenue: totalRevenue,
        bookings: bookings.length,
        active: activeRentals,
        customers: usersSnap.size
      });
    };
    fetchStats();
  }, []);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [5000, 12000, 8000, 15000, 25000, 30000, 22000],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const topCarsData = {
    labels: ['Model S', 'Defender', '911 Carrera'],
    datasets: [
      {
        label: 'Bookings',
        data: [12, 8, 5],
        backgroundColor: ['#6366f1', '#818cf8', '#a5b4fc'],
        borderRadius: 12,
      },
    ],
  };

  const doughnutData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard icon={DollarSign} label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="indigo" />
        <StatsCard icon={TrendingUp} label="Bookings" value={stats.bookings} color="emerald" />
        <StatsCard icon={Activity} label="Active" value={stats.active} color="amber" />
        <StatsCard icon={Users} label="Customers" value={stats.customers} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Weekly Revenue Performance</h3>
          <div className="h-[300px]">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Popular Vehicles</h3>
          <div className="h-[250px]">
            <Bar data={topCarsData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Booking Status</h3>
          <div className="aspect-square max-w-[200px] mx-auto">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className={`${colors[color]} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
    </div>
  );
}

function FleetManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    name: '', brand: '', pricePerHour: 0, pricePerDay: 0, fuelType: 'Petrol', seats: 5, transmission: 'Automatic', status: 'available', imageUrl: ''
  });

  useEffect(() => {
    const fetchCars = async () => {
      const snap = await getDocs(collection(db, 'cars'));
      setCars(snap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));
    };
    fetchCars();
  }, []);

  const handleAddCar = async () => {
    if (!newCar.name || !newCar.brand || !newCar.imageUrl) {
      alert("Please fill in the Car Model, Brand, and Image URL.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'cars'), newCar);
      setCars([...cars, { id: docRef.id, ...newCar } as Car]);
      setIsAdding(false);
      setNewCar({ name: '', brand: '', pricePerHour: 0, pricePerDay: 0, fuelType: 'Petrol', seats: 5, transmission: 'Automatic', status: 'available', imageUrl: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to add car. Check console.");
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      await deleteDoc(doc(db, 'cars', id));
      setCars(cars.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Fleet Management</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Car</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2rem] border border-indigo-100 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Car Model</label>
              <input placeholder="e.g. Model S" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Brand</label>
              <input placeholder="e.g. Tesla" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newCar.brand} onChange={e => setNewCar({ ...newCar, brand: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price Per Day (₹)</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newCar.pricePerDay || ''} onChange={e => setNewCar({ ...newCar, pricePerDay: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
              <input placeholder="https://example.com/car.jpg" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newCar.imageUrl || ''} onChange={e => setNewCar({ ...newCar, imageUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newCar.status} onChange={e => setNewCar({ ...newCar, status: e.target.value as any })}>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 font-bold text-gray-500">Cancel</button>
            <button onClick={handleAddCar} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">Save Car</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Car Model</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Price/Day</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cars.map(car => (
              <tr key={car.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-gray-900">{car.name}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{car.brand}</p>
                </td>
                <td className="px-8 py-6 font-bold text-gray-900">₹{car.pricePerDay}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    car.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 
                    car.status === 'booked' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {car.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"><Edit className="h-5 w-5" /></button>
                    <button onClick={() => handleDeleteCar(car.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingManagement() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const snap = await getDocs(collection(db, 'bookings'));
    const bookingsData = await Promise.all(snap.docs.map(async (d) => {
      const data = d.data();
      const carSnap = await getDoc(doc(db, 'cars', data.carId));
      return { 
        id: d.id, 
        ...data, 
        carName: carSnap.exists() ? carSnap.data().name : 'Unknown Car',
        carBrand: carSnap.exists() ? carSnap.data().brand : ''
      };
    }));
    setBookings(bookingsData);
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'bookings', id), { status });
    
    // If approved, update user loyalty points +50
    if (status === 'approved') {
      const booking = bookings.find(b => b.id === id);
      if (booking && booking.userId) {
        const userRef = doc(db, 'users', booking.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentPoints = userSnap.data().loyaltyPoints || 0;
          await updateDoc(userRef, { loyaltyPoints: currentPoints + 50 });
        }
      }
    }
    
    fetchBookings();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Booking Requests</h2>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Booking ID</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-gray-900 leading-tight">{booking.carName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{booking.carBrand}</p>
                  <p className="font-mono text-[8px] text-gray-300 mt-2">ID: {booking.id}</p>
                </td>
                <td className="px-8 py-6 font-bold text-gray-900">₹{booking.totalPrice}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    booking.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                    booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {booking.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateBookingStatus(booking.id, 'approved')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"><Check className="h-4 w-4" /></button>
                      <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"><X className="h-4 w-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0, expiryDate: '', active: true });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const snap = await getDocs(collection(db, 'coupons'));
    setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
  };

  const addCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount || !newCoupon.expiryDate) {
      alert("Please provide a valid code, discount percentage, and expiry date.");
      return;
    }
    try {
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        expiryDate: new Date(newCoupon.expiryDate)
      });
      setNewCoupon({ code: '', discount: 0, expiryDate: '', active: true });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Failed to create coupon.");
    }
  };

  const deleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, 'coupons', id));
    fetchCoupons();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Coupon Management</h2>
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input placeholder="CODE10" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold uppercase" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} />
          <input type="number" placeholder="Discount %" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: parseInt(e.target.value)})} />
          <input type="date" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
        </div>
        <button onClick={addCoupon} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 hover:bg-indigo-600 transition-all shadow-lg">
          <Plus className="h-5 w-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Code</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Discount</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map(coupon => (
              <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6 font-black text-indigo-600">{coupon.code}</td>
                <td className="px-8 py-6 font-bold text-gray-900">{coupon.discount}%</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                    {coupon.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmergencyManagement() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const q = query(collection(db, 'emergency_requests'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const resolveRequest = async (id: string) => {
    await updateDoc(doc(db, 'emergency_requests', id), { status: 'resolved' });
    fetchRequests();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-3">
          <Bell className="h-6 w-6 text-red-500 animate-pulse" />
          <span>Active SOS Signals</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <div className="bg-white p-16 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
            <p className="text-gray-400 font-bold">No active emergency signals</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className={`p-8 rounded-[2.5rem] border flex items-center justify-between transition-all ${
              req.status === 'pending' ? 'bg-red-50 border-red-100 shadow-lg shadow-red-50' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center space-x-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  req.status === 'pending' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                }`}>
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{req.userName}</h3>
                  <p className="text-sm text-gray-500 font-bold">{req.userEmail}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                    {req.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {req.status === 'pending' ? (
                  <button
                    onClick={() => resolveRequest(req.id)}
                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center space-x-2 shadow-lg"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark as Resolved</span>
                  </button>
                ) : (
                  <span className="text-emerald-600 font-black uppercase tracking-widest text-xs flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
