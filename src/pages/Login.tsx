import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Car, Star, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const PERKS = [
  { icon: Shield, text: 'Fully insured vehicles' },
  { icon: Zap, text: 'Instant booking confirmation' },
  { icon: Star, text: 'Earn loyalty points per trip' },
];

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true); setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));

      if (snap.exists() && snap.data().role === 'admin') {
        window.location.href = 'http://localhost:3001';
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.code === 'auth/invalid-credential' ? 'Wrong email or password.' : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden hero-gradient flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"
            alt="Luxury car"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29]/80 to-[#302b63]/60" />
        </div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-indigo-600/30 rounded-full blur-[100px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Vel cars</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            Welcome<br />back to the<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">open road</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">Sign in and pick up right where you left off.</p>
          <div className="space-y-4">
            {PERKS.map(p => (
              <div key={p.text} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                  <p.icon className="h-4 w-4 text-indigo-300" />
                </div>
                <span className="text-white/80 font-medium">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-4">
          <div className="flex -space-x-2">
            {['bg-indigo-400', 'bg-violet-400', 'bg-pink-400'].map((c, i) => (
              <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-[#1e1b4b]`} />
            ))}
          </div>
          <p className="text-white/60 text-sm">10,000+ happy renters</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#f8fafc]">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center space-x-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">Vel cars</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Sign in</h1>
            <p className="text-gray-500 font-medium">Enter your credentials to access your account</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 h-5 w-5" />
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-12"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="input-field pl-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
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
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 font-medium mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
