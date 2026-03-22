import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { Car } from '../types';
import CarCard from '../components/CarCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [wishlistCars, setWishlistCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) return;

      const q = query(collection(db, 'wishlist'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const carIds = snap.docs.map(d => d.data().carId);

      if (carIds.length === 0) {
        setWishlistCars([]);
        setLoading(false);
        return;
      }

      const carsSnap = await getDocs(collection(db, 'cars'));
      const allCars = carsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Car));
      const filteredCars = allCars.filter(c => carIds.includes(c.id));
      
      setWishlistCars(filteredCars);
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center space-x-4 mb-12">
        <div className="p-3 bg-red-50 rounded-2xl">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
          <p className="text-gray-500 font-medium mt-1">Your favorite cars waiting for your next journey</p>
        </div>
      </div>

      {wishlistCars.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Explore our premium fleet and save the cars you love for later.</p>
          <Link
            to="/cars"
            className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200"
          >
            Explore Cars
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
