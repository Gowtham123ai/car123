import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, Loader2, Car, Star, Gift, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type SignupFormValues = z.infer<typeof signupSchema>;

const BENEFITS = [
  'Earn 100 free welcome loyalty points',
  'Access to 500+ premium vehicles',
  'Apply coupons & loyalty discounts',
  '24/7 emergency roadside support',
];

export default function Signup() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true); setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'user',
        loyaltyPoints: 100,   // welcome bonus
        subscriptionPlan: 'Free',
        createdAt: new Date().toISOString(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use' ? 'That email is already registered.' : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1200"
            alt="Drive"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute bottom-1/3 right-0 w-72 h-72 bg-violet-600/20 rounded-full blur-[100px]" />

        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black text-white">Vel cars</span>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <Gift className="h-4 w-4 text-amber-400" />
            <span className="text-white text-sm font-semibold">100 free points on signup</span>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            Join the<br />Vel cars<br />
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">community</span>
          </h2>
          <div className="space-y-3">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-white/75 font-medium">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <span className="text-white/60 ml-2 text-sm">4.9/5 from 10,000+ reviews</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-[#f8fafc] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center space-x-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">Vel cars</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create account</h1>
            <p className="text-gray-500 font-medium">Start your journey in under a minute</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input {...register('name')} type="text" className="input-field pl-12" placeholder="John Doe" autoComplete="name" />
              </div>
              {errors.name && <p className="text-xs text-red-500 font-semibold">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input {...register('email')} type="email" className="input-field pl-12" placeholder="name@example.com" autoComplete="email" />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input {...register('phone')} type="tel" className="input-field pl-12" placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
              {errors.phone && <p className="text-xs text-red-500 font-semibold">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input {...register('password')} type="password" className="input-field pl-12" placeholder="Min. 6 characters" autoComplete="new-password" />
              </div>
              {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4 !text-base !rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 font-medium">
              By signing up you agree to our{' '}
              <span className="text-indigo-600 cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </form>

          <p className="text-center text-gray-500 font-medium mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
