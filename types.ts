export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badges: string[];
  dosage?: string;
  description?: string;
  ingredients?: string[];
  benefits?: string[];
  warnings?: string[];
  science?: {
    studyTitle: string;
    result: string;
    participants: number;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  availability: string; // e.g., "Today", "Tomorrow"
  image: string;
  verified: boolean;
  type: 'telehealth' | 'in-person';
}

export interface HealthMetric {
  date: string;
  score: number;
  label: string;
}

export interface UserProfile {
  name: string;
  healthScore: number;
  nextRefill: string;
  recommendedFocus: string;
  conditions: string[];
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

export interface Review {
  id: string;
  productId: string; // References Product or Doctor ID
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
}