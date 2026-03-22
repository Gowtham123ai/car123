import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogOut, User, Car, LayoutDashboard, Menu, X, Star, GitCompare, Heart, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    setCompareCount(list.length);
  }, [location]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-200">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Vel<span className="text-indigo-600"> cars</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { label: 'Browse Cars', path: '/cars' },
              { label: 'Compare', path: '/compare' },
              { label: 'Plans', path: '/subscriptions' },
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {item.path === '/compare' && compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                  />
                )}
              </Link>
            ))}

            <div className="w-px h-4 bg-gray-200 mx-2" />

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard/wishlist"
                  title="Wishlist"
                  className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/dashboard') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span>{user.displayName?.split(' ')[0] || 'Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary !py-2 !px-5 !text-sm !rounded-xl">
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {[
                { label: 'Browse Cars', path: '/cars' },
                { label: 'Compare', path: '/compare' },
                { label: 'Subscription Plans', path: '/subscriptions' },
              ].map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl font-semibold transition-all ${
                    isActive(item.path) ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {item.path === '/compare' && compareCount > 0 && (
                    <span className="badge badge-indigo">{compareCount}</span>
                  )}
                </Link>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-100">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-50 font-semibold">
                      <LayoutDashboard className="h-5 w-5 text-indigo-500" />
                      <span>My Dashboard</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 font-semibold">
                      <LogOut className="h-5 w-5" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-50 font-semibold text-center">Sign In</Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="btn-primary w-full">
                      <span>Get Started</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
