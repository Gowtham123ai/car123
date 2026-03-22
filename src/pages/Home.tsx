import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Car } from '../types';
import CarCard from '../components/CarCard';
import {
  ShieldCheck, Zap, CreditCard, ChevronRight, Star,
  MapPin, Clock, Trophy, Users, ArrowRight, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' as const }
  })
};

const STATS = [
  { value: '10K+', label: 'Happy Renters', icon: Users },
  { value: '500+', label: 'Premium Cars', icon: Trophy },
  { value: '50+', label: 'Cities Covered', icon: MapPin },
  { value: '24/7', label: 'Support', icon: Clock },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Fully Insured',
    desc: 'All vehicles come with comprehensive insurance for complete peace of mind.',
    color: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600'
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    desc: 'Real-time availability and instant confirmation. No waiting, ever.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600'
  },
  {
    icon: CreditCard,
    title: 'Flexible Payments',
    desc: 'UPI, Card, Net Banking — all powered by Razorpay for secure checkout.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    text: 'text-amber-600'
  },
  {
    icon: Star,
    title: 'Loyalty Rewards',
    desc: 'Earn points on every booking and redeem them for discounts on future rides.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    text: 'text-rose-600'
  },
];

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'cars'), where('status', '==', 'available'), limit(6));
    getDocs(q).then(snap => {
      setFeaturedCars(snap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));
      setLoading(false);
    });
  }, []);

  return (
    <div className="pb-24">

      {/* ───── HERO ───── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden hero-gradient">
        {/* Background layers */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000"
            alt="Luxury car"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29]/60 via-[#302b63]/40 to-[#0f0c29]/80" />
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24">
          <div className="max-w-3xl">

            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-white text-sm font-semibold">India's #1 Premium Car Rental Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight text-white"
            >
              Drive the Car{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                You Deserve
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-xl"
            >
              Curated fleet of luxury &amp; economy vehicles. Instant booking, Razorpay checkout,
              and loyalty rewards — all in one platform.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/cars" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-indigo-900/50 transition-all hover:-translate-y-0.5">
                <span>Explore Fleet</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link to="/subscriptions" className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white text-base font-bold px-8 py-4 rounded-2xl border-2 border-white/40 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                View Plans
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="flex items-center space-x-6 mt-12"
            >
              <div className="flex -space-x-3">
                {['bg-indigo-400', 'bg-violet-400', 'bg-pink-400', 'bg-amber-400'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 ${c} rounded-full border-2 border-[#1e1b4b] flex items-center justify-center text-white text-xs font-bold`}>
                    {['A', 'K', 'R', 'M'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-white/90 text-sm font-bold ml-1">4.9</span>
                </div>
                <p className="text-white/50 text-xs mt-0.5">Trusted by 10,000+ happy customers</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent" />
      </section>

      {/* ───── STATS ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="card p-6 text-center group hover:border-indigo-100"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <s.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="stat-number text-gray-900">{s.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Why Vel cars</p>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Everything you need,{' '}
            <span className="gradient-text">nothing you don't</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="card p-8 group cursor-default"
            >
              <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`h-7 w-7 ${f.text}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── FEATURED CARS ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="section-label mb-2">Our Fleet</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Featured Vehicles</h2>
            <p className="text-gray-500 mt-2 font-medium">Handpicked premium cars for your next adventure</p>
          </div>
          <Link
            to="/cars"
            className="hidden md:flex items-center space-x-2 text-indigo-600 font-bold hover:space-x-3 transition-all group"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
        ) : featuredCars.length === 0 ? (
          <div className="card-xl p-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-gray-400">No cars available right now</p>
            <p className="text-gray-400 mt-2 text-sm">Please check back shortly or contact support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car, i) => (
              <motion.div
                key={car.id}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link to="/cars" className="btn-outline">
            View All Cars
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Process</p>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Book in 3 easy steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200" />
          {[
            { step: '01', title: 'Pick your car', desc: 'Browse our curated fleet and filter by budget, type, or features.' },
            { step: '02', title: 'Choose dates', desc: 'Select pickup and return dates using our real-time availability calendar.' },
            { step: '03', title: 'Pay & Drive', desc: 'Razorpay-powered checkout, instant confirmation, and enjoy the road.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="card p-8 text-center relative"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <span className="text-white font-black text-xl">{item.step}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative rounded-[2.5rem] overflow-hidden p-12 md:p-20 text-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' }}
        >
          {/* decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">Limited Time Offer</p>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Ready to hit<br />the open road?
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              Join 10,000+ happy renters. Sign up today and get 100 free loyalty points on your first booking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-ghost !bg-white !text-indigo-600 hover:!bg-gray-50 !border-white shadow-2xl text-base px-10 py-4 rounded-2xl font-black">
                Get Started Free
              </Link>
              <Link to="/cars" className="btn-ghost text-base px-10 py-4 rounded-2xl">
                Browse Cars
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
