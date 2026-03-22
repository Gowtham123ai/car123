import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists() || docSnap.data().role !== 'admin') {
            if (user.email === 'admin@admin.com') {
              try {
                await setDoc(docRef, {
                  email: user.email,
                  role: 'admin',
                  createdAt: new Date().toISOString()
                }, { merge: true });
                setIsAdmin(true);
                return;
              } catch (seedErr) {
                console.error("Could not auto-create admin doc", seedErr);
              }
            }
            alert("Login successful, but you are not recognized as an Admin! You must manually create a document in the Firestore 'users' collection with your UID and `role: 'admin'`.");
            setIsAdmin(false);
          } else {
            setIsAdmin(true);
          }
        } catch (err: any) {
          console.error("Firestore Error:", err);
          if (err.code === 'permission-denied') {
            alert("Database Error: Missing Permissions! Please update your Firestore Security Rules to allow reads/writes.");
          }
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(null);
      }
    };
    checkAdmin();
  }, [user]);

  if (loading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={!user || !isAdmin ? <Login /> : <Navigate to="/" replace />} />
          <Route
            path="/*"
            element={
              user && isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
