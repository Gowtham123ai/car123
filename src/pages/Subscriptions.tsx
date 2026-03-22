import { db, auth } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Shield, Crown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Basic',
    price: 5000,
    features: ['Limited hours (50/mo)', 'Standard cars only', 'Basic support', 'No weekend surcharge'],
    icon: Zap,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    name: 'Premium',
    price: 8000,
    features: ['Unlimited weekends', 'Premium cars included', 'Priority support', 'Free cancellation', 'Loyalty points x2'],
    icon: Shield,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    featured: true,
  },
  {
    name: 'Pro',
    price: 15000,
    features: ['Unlimited hours', 'All car categories', '24/7 Concierge', 'Airport pickup/drop', 'Zero security deposit'],
    icon: Crown,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

export default function Subscriptions() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(planName);
    try {
      // In a real app, you would integrate Razorpay here too
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        subscriptionPlan: planName,
      });
      alert(`Successfully subscribed to ${planName} plan!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-6">Choose Your <span className="text-indigo-600">Freedom</span></h1>
        <p className="text-xl text-gray-500 font-medium leading-relaxed">
          Unlock exclusive benefits and save more with our flexible subscription plans. Tailored for every journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -8 }}
            className={`relative bg-white p-10 rounded-[2.5rem] border transition-all ${
              plan.featured ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-gray-100 shadow-sm'
            }`}
          >
            {plan.featured && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}

            <div className={`${plan.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
              <plan.icon className={`h-8 w-8 ${plan.color}`} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{plan.name}</h3>
            <div className="flex items-baseline space-x-1 mb-8">
              <span className="text-4xl font-black text-gray-900">₹{plan.price}</span>
              <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">/ month</span>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start space-x-3 text-gray-600 font-medium">
                  <div className="mt-1 bg-emerald-50 rounded-full p-0.5">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.name)}
              disabled={loading !== null}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 ${
                plan.featured ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-900 text-white hover:bg-indigo-600'
              }`}
            >
              {loading === plan.name ? <Loader2 className="h-6 w-6 animate-spin" /> : <span>Subscribe Now</span>}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 bg-gray-900 rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black mb-6 tracking-tight">Enterprise Fleet Solutions</h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
              Need more than 10 cars for your business? We offer customized corporate plans with dedicated account managers and maintenance support.
            </p>
            <button className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl">
              Contact Sales
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <p className="text-3xl font-black mb-1">500+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Corporate Clients</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <p className="text-3xl font-black mb-1">24/7</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority Support</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <p className="text-3xl font-black mb-1">0%</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Security Deposit</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <p className="text-3xl font-black mb-1">100%</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tax Deductible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
