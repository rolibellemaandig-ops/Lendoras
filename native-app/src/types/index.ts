// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  reviews_count: number;
}

// Item Types
export interface Item {
  id: string;
  name: string;
  description: string;
  category: 'Electronics' | 'Sports' | 'Outdoors' | 'Books' | 'Furniture';
  daily_price: number;
  condition: 'Like New' | 'Good' | 'Fair';
  location: string;
  image?: string;
  seller_id: string;
  seller_name: string;
  seller_rating: number;
  seller_reviews: number;
  latitude?: string;
  longitude?: string;
  created_at: string;
}

// Rental Types
export interface Rental {
  id: string;
  item_id: string;
  item_name: string;
  renter_id: string;
  seller_id: string;
  seller_name: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'Pending' | 'Authorized' | 'Active' | 'Completed' | 'Cancelled';
  created_at: string;
}

// Message Types
export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  is_read: boolean;
}

// Review Types
export interface Review {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Auth Types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  MainApp: undefined;
  Login: undefined;
  Register: undefined;
  ItemDetail: { itemId: string };
};

export type BottomTabParamList = {
  ExploreStack: undefined;
  MapStack: undefined;
  SellStack: undefined;
  MessagesStack: undefined;
  RentalsStack: undefined;
  ProfileStack: undefined;
};
