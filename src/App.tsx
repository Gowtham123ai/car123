import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Compare from './pages/Compare';
import UserDashboard from './pages/UserDashboard';
import Subscriptions from './pages/Subscriptions';
import { UserProfile } from './types';

function AdminRedirect() {
  window.location.href = 'http://localhost:3001';
  return null;
}

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile({ uid: user.uid, ...docSnap.data() } as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setProfileLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/subscriptions" element={<Subscriptions />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard/*"
              element={user ? <UserDashboard /> : <Navigate to="/login" />}
            />

            {/* Legacy Admin Redirect */}
            <Route
              path="/admin/*"
              element={<AdminRedirect />}
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Vel cars Car Rental. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}
