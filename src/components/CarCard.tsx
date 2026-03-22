import { Link } from 'react-router-dom';
import { Car } from '../types';
import { Users, Fuel, Settings, CheckCircle2, AlertCircle, Clock, Star, Heart, GitCompare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface CarCardProps { car: Car; }

export default function CarCard({ car }: CarCardProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [isCompared, setIsCompared] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    setIsCompared(compareList.includes(car.id));

    const fetchRating = async () => {
      const q = query(collection(db, 'reviews'), where('carId', '==', car.id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const total = snap.docs.reduce((acc, d) => acc + d.data().rating, 0);
        setRating(total / snap.size);
        setReviewCount(snap.size);
      }
    };

    const checkWishlist = async () => {
      if (auth.currentUser) {
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', auth.currentUser.uid),
          where('carId', '==', car.id)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setIsWishlisted(true);
          setWishlistId(snap.docs[0].id);
        }
      }
    };

    fetchRating();
    checkWishlist();
  }, [car.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!auth.currentUser) { alert('Please sign in to save to wishlist'); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted && wishlistId) {
        await deleteDoc(doc(db, 'wishlist', wishlistId));
        setIsWishlisted(false); setWishlistId(null);
      } else {
        const ref = await addDoc(collection(db, 'wishlist'), {
          userId: auth.currentUser.uid,
          carId: car.id,
          createdAt: new Date()
        });
        setIsWishlisted(true); setWishlistId(ref.id);
      }
    } finally { setWishlistLoading(false); }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const list: string[] = JSON.parse(localStorage.getItem('compareList') || '[]');
    if (isCompared) {
      localStorage.setItem('compareList', JSON.stringify(list.filter(id => id !== car.id)));
      setIsCompared(false);
    } else {
      if (list.length >= 4) { alert('Max 4 cars for comparison'); return; }
      localStorage.setItem('compareList', JSON.stringify([...list, car.id]));
      setIsCompared(true);
    }
  };

  const statusConfig = {
    available:   { label: 'Available',    cls: 'badge-green',  icon: <CheckCircle2 className="h-3 w-3" /> },
    booked:      { label: 'Booked',       cls: 'badge-red',    icon: <Clock className="h-3 w-3" /> },
    maintenance: { label: 'Maintenance',  cls: 'badge-amber',  icon: <AlertCircle className="h-3 w-3" /> },
  };

  const status = statusConfig[car.status] ?? statusConfig.available;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/80 transition-shadow group relative"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
        <img
          src={car.imageUrl || `https://picsum.photos/seed/${car.name}/800/500`}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Top action buttons */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
              isWishlisted
                ? 'bg-rose-500 text-white shadow-rose-200'
                : 'bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleCompare}
            title="Add to compare"
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
              isCompared
                ? 'bg-indigo-600 text-white shadow-indigo-200'
                : 'bg-white/90 text-gray-400 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <GitCompare className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`badge ${status.cls} shadow-sm backdrop-blur-sm`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* Price overlay at bottom of image */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-1.5 shadow-lg">
            <span className="text-indigo-700 font-black text-base">₹{car.pricePerDay.toLocaleString()}</span>
            <span className="text-gray-400 text-xs font-semibold">/day</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Title & rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{car.name}</h3>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{car.brand}</p>
          </div>
          {rating !== null && (
            <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-xl ml-3 flex-shrink-0">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-700">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-amber-500">({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Specs chips */}
        <div className="flex items-center space-x-2 mb-5">
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            <Users className="h-3 w-3" />
            <span>{car.seats}p</span>
          </span>
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            <Fuel className="h-3 w-3" />
            <span>{car.fuelType}</span>
          </span>
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            <Settings className="h-3 w-3" />
            <span>{car.transmission.slice(0, 4)}</span>
          </span>
        </div>

        {/* CTA */}
        <Link
          to={`/cars/${car.id}`}
          className={`flex items-center justify-center space-x-2 w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200 group/btn ${
            car.status === 'available'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200'
              : 'bg-gray-100 text-gray-400 pointer-events-none'
          }`}
        >
          <span>{car.status === 'available' ? 'Book Now' : 'Unavailable'}</span>
          {car.status === 'available' && (
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          )}
        </Link>
      </div>
    </motion.div>
  );
}
