export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  loyaltyPoints: number;
  subscriptionPlan?: string;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  pricePerHour: number;
  pricePerDay: number;
  fuelType: string;
  seats: number;
  transmission: string;
  imageUrl: string;
  status: 'available' | 'booked' | 'maintenance';
  forSale?: boolean;
  salePrice?: number;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  usageLimit: number;
  usageUsed: number;
  expiryDate: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  expiryDate: Date;
  active: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  timestamp: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface Review {
  id: string;
  carId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface WishlistItem {
  userId: string;
  carId: string;
  createdAt: Date;
}

export interface EmergencyRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}
