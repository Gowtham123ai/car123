import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Car, Booking, UserProfile, Review, Coupon } from '../types';
import BookingCalendar from '../components/BookingCalendar';
import { Users, Fuel, Settings, ShieldCheck, MapPin, Star, ChevronLeft, Loader2, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInDays, format } from 'date-fns';

export default function CarDetails() {
  const { id } = useParams();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [bookedDates, setBookedDates] = useState<{ start: Date; end: Date }[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingRange, setBookingRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setUserProfile({ uid: snap.id, ...snap.data() } as UserProfile);
        }
      };
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);

      try {
        // Fetch Car
        const carSnap = await getDoc(doc(db, 'cars', id));
        if (carSnap.exists()) {
          setCar({ id: carSnap.id, ...carSnap.data() } as Car);
        }

        // Fetch Bookings for this car to show on calendar
        const bookingsQ = query(
          collection(db, 'bookings'),
          where('carId', '==', id)
        );
        const bookingsSnap = await getDocs(bookingsQ);
        const dates = bookingsSnap.docs
          .filter(doc => ['approved', 'pending'].includes(doc.data().status))
          .map(doc => {
            const data = doc.data();
            return {
              start: data.startDate.toDate(),
              end: data.endDate.toDate()
            };
          });
        setBookedDates(dates);

        // Fetch Reviews
        const reviewsQ = query(
          collection(db, 'reviews'),
          where('carId', '==', id)
          // Removed orderBy to avoid multi-field index requirement
        );
        const reviewsSnap = await getDocs(reviewsQ);
        const reviewsData = reviewsSnap.docs
          .map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate() || new Date()
          } as Review))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Manual sort instead of Firestore orderBy

        setReviews(reviewsData);

        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
          setAvgRating(sum / reviewsData.length);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (car && bookingRange.start && bookingRange.end) {
      const days = differenceInDays(bookingRange.end, bookingRange.start) + 1;
      let basePrice = days * car.pricePerDay;
      let currentDiscount = 0;

      if (appliedCoupon) {
        currentDiscount += (basePrice * appliedCoupon.discount) / 100;
      }

      const priceAfterCoupon = basePrice - currentDiscount;

      if (usePoints && userProfile) {
        const pointsValue = Math.min(priceAfterCoupon, userProfile.loyaltyPoints);
        setPointsToRedeem(pointsValue);
        currentDiscount += pointsValue;
      } else {
        setPointsToRedeem(0);
      }

      setDiscount(currentDiscount);
      setTotalPrice(Math.max(0, basePrice - currentDiscount));
    } else {
      setTotalPrice(0);
      setDiscount(0);
    }
  }, [bookingRange, car, appliedCoupon, usePoints, userProfile]);

  const applyCoupon = async () => {
    if (!couponCode) return;
    const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()), where('active', '==', true));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
      if (new Date(coupon.expiryDate) > new Date()) {
        setAppliedCoupon(coupon);
        alert(`Coupon ${coupon.code} applied! ${coupon.discount}% off.`);
      } else {
        alert('Coupon expired');
      }
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingRange.start || !bookingRange.end || !car) return;

    setIsBooking(true);
    try {
      // 1. Create Order on Server
      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice }),
      });
      const order = await response.json();

      // 2. Open Razorpay
      const options = {
        key: 'rzp_test_placeholder', // Should be from env in real app
        amount: order.amount,
        currency: order.currency,
        name: "Vel cars",
        description: `Booking for ${car.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify Payment and Create Booking
          const bookingData = {
            userId: user.uid,
            carId: car.id,
            startDate: bookingRange.start,
            endDate: bookingRange.end,
            totalPrice: totalPrice,
            status: 'pending', // Set to pending for approval system
            paymentStatus: 'paid',
            createdAt: serverTimestamp(),
            razorpayPaymentId: response.razorpay_payment_id,
            pointsRedeemed: pointsToRedeem,
            couponUsed: appliedCoupon?.code || null
          };

          const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);

          // Send Confirmation Email (Optional: mention it's pending approval)
          try {
            await fetch('/api/email/confirm-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                bookingDetails: {
                  carName: car.name,
                  bookingId: bookingRef.id,
                  startDate: format(bookingRange.start!, 'MMM d, yyyy'),
                  endDate: format(bookingRange.end!, 'MMM d, yyyy'),
                  totalPrice: totalPrice,
                  paymentId: response.razorpay_payment_id
                }
              }),
            });
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }

          // Record Payment Transaction
          await addDoc(collection(db, 'payments'), {
            userId: user.uid,
            amount: totalPrice,
            method: 'Razorpay',
            status: 'success',
            timestamp: serverTimestamp(),
            razorpayOrderId: order.id,
            razorpayPaymentId: response.razorpay_payment_id,
            description: `Booking for ${car.name}`
          });

          // Update car status if needed or just rely on date logic

          // Add loyalty points
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentPoints = userSnap.data().loyaltyPoints || 0;
            await updateDoc(userRef, { loyaltyPoints: currentPoints + 50 });
          }

          navigate('/dashboard/bookings');
        },
        prefill: {
          email: user.email,
        },
        theme: { color: "#4f46e5" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Something went wrong with the booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!car) {
    return <div className="text-center py-20">Car not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Back to Fleet</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Car Info */}
        <div className="lg:col-span-2 space-y-10">
          <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img
              src={car.imageUrl || `https://picsum.photos/seed/${car.name}/1200/800`}
              alt={car.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {car.brand}
                  </span>
                  <div className="flex items-center text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-bold ml-1 text-gray-900">
                      {avgRating > 0 ? `${avgRating.toFixed(1)} (${reviews.length} reviews)` : 'No reviews yet'}
                    </span>
                  </div>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{car.name}</h1>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-indigo-600">₹{car.pricePerDay}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">per day</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                <Users className="h-6 w-6 text-indigo-500 mb-2" />
                <span className="text-sm font-bold text-gray-900">{car.seats} Seats</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                <Fuel className="h-6 w-6 text-indigo-500 mb-2" />
                <span className="text-sm font-bold text-gray-900">{car.fuelType}</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                <Settings className="h-6 w-6 text-indigo-500 mb-2" />
                <span className="text-sm font-bold text-gray-900">{car.transmission}</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                <ShieldCheck className="h-6 w-6 text-indigo-500 mb-2" />
                <span className="text-sm font-bold text-gray-900">Insured</span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Description</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                Experience luxury and performance with the {car.name}. This vehicle is meticulously maintained and comes with all modern features to ensure a comfortable journey. Perfect for city drives or long weekend getaways.
              </p>
            </div>

            {/* Reviews Section */}
            <div className="pt-10 border-t border-gray-100 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Guest Reviews</h3>
                <div className="flex items-center space-x-1 text-amber-400">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-lg font-black text-gray-900">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400 font-bold">({reviews.length})</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-2xl text-center text-gray-400 font-medium">
                  No reviews yet. Be the first to ride and review!
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-6 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{review.userName}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                              {format(review.createdAt, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="space-y-8">
          <BookingCalendar
            bookedDates={bookedDates}
            onSelectRange={(start, end) => setBookingRange({ start, end })}
          />

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Price Summary</h3>

            {bookingRange.start && bookingRange.end ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-gray-500">
                  <span>Duration</span>
                  <span className="text-gray-900 font-bold">
                    {differenceInDays(bookingRange.end, bookingRange.start) + 1} Days
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-500">
                  <span>Price per day</span>
                  <span className="text-gray-900 font-bold">₹{car.pricePerDay}</span>
                </div>

                {/* Loyalty Points Section */}
                {userProfile && userProfile.loyaltyPoints > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                        <span className="text-xs font-bold text-gray-700">Use Loyalty Points</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">You have {userProfile.loyaltyPoints} points available</p>
                  </div>
                )}

                {/* Coupon Section */}
                <div className="pt-4 border-t border-gray-100 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Price</span>
                  <span className="text-2xl font-black text-indigo-600">₹{totalPrice}</span>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isBooking || car.status !== 'available'}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isBooking ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Book Now</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 font-medium">
                Select dates to see pricing
              </div>
            )}

            <div className="flex items-center space-x-3 text-xs text-gray-400 font-bold uppercase tracking-wider justify-center">
              <ShieldCheck className="h-4 w-4" />
              <span>Secure Payment Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
