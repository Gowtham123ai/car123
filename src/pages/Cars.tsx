import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Car } from '../types';
import CarCard from '../components/CarCard';
import { Search, SlidersHorizontal, X, GitCompare, Car as CarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const FUEL_OPTIONS = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
const TRANS_OPTIONS = ['All', 'Automatic', 'Manual'];
const SORT_OPTIONS = [
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A → Z', value: 'name_asc' },
];

export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brand, setBrand] = useState('');
  const [fuel, setFuel] = useState('All');
  const [trans, setTrans] = useState('All');
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sort, setSort] = useState('price_asc');
  const [showFilters, setShowFilters] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  useEffect(() => {
    getDocs(collection(db, 'cars'))
      .then(snap => {
        setCars(snap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));
      })
      .catch(error => {
        console.error("Error fetching cars:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    setCompareCount(list.length);
  });

  const brands = ['All', ...Array.from(new Set(cars.map(c => c.brand)))];

  const filtered = cars
    .filter(c => {
      const q = searchTerm.toLowerCase();
      return (
        (c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q)) &&
        (brand === '' || brand === 'All' || c.brand === brand) &&
        (fuel === 'All' || c.fuelType === fuel) &&
        (trans === 'All' || c.transmission === trans) &&
        c.pricePerDay <= maxPrice
      );
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return a.pricePerDay - b.pricePerDay;
      if (sort === 'price_desc') return b.pricePerDay - a.pricePerDay;
      return a.name.localeCompare(b.name);
    });

  const hasFilters = brand !== '' && brand !== 'All' || fuel !== 'All' || trans !== 'All' || maxPrice < 20000;

  const resetFilters = () => {
    setBrand(''); setFuel('All'); setTrans('All'); setMaxPrice(20000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="section-label mb-2">Our Fleet</p>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Browse All Vehicles</h1>
            <p className="text-gray-500 font-medium mt-2">
              {loading ? 'Loading...' : `${filtered.length} of ${cars.length} vehicles`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {compareCount > 0 && (
              <Link
                to="/compare"
                className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-2xl font-bold text-sm border border-indigo-100 hover:bg-indigo-100 transition-all"
              >
                <GitCompare className="h-4 w-4" />
                <span>Compare ({compareCount})</span>
              </Link>
            )}

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input-field !py-2.5 !w-auto pr-8 text-sm cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-sm border transition-all ${
                showFilters || hasFilters
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {hasFilters && <span className="w-2 h-2 bg-white rounded-full opacity-80" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, brand..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-12 !py-4 !text-base"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="card p-8 border border-indigo-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Brand */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Brand</label>
                  <div className="flex flex-wrap gap-2">
                    {brands.map(b => (
                      <button
                        key={b}
                        onClick={() => setBrand(b === 'All' ? '' : b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          (b === 'All' && !brand) || brand === b
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Fuel Type</label>
                  <div className="flex flex-wrap gap-2">
                    {FUEL_OPTIONS.map(f => (
                      <button
                        key={f}
                        onClick={() => setFuel(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          fuel === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Transmission</label>
                  <div className="flex flex-wrap gap-2">
                    {TRANS_OPTIONS.map(t => (
                      <button
                        key={t}
                        onClick={() => setTrans(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          trans === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max price */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Max Price: <span className="text-indigo-600">₹{maxPrice.toLocaleString()}/day</span>
                  </label>
                  <input
                    type="range" min="1000" max="20000" step="500"
                    value={maxPrice}
                    onChange={e => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>₹1,000</span>
                    <span>₹20,000</span>
                  </div>
                </div>
              </div>

              {hasFilters && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-500">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''} match your filters
                  </p>
                  <button onClick={resetFilters} className="flex items-center space-x-1.5 text-red-500 font-bold text-sm hover:text-red-600">
                    <X className="h-4 w-4" />
                    <span>Clear all filters</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-3xl overflow-hidden">
              <div className="skeleton aspect-[16/10]" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-5 w-3/5 rounded-xl" />
                <div className="skeleton h-4 w-2/5 rounded-xl" />
                <div className="skeleton h-10 rounded-2xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filtered.map((car, i) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-24 card">
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CarIcon className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No vehicles match your search</h3>
          <p className="text-gray-400 mb-6">Try a different search term or adjust your filters.</p>
          {hasFilters && (
            <button onClick={resetFilters} className="btn-outline">Clear Filters</button>
          )}
        </div>
      )}
    </div>
  );
}
