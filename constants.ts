import { Product, Doctor, UserProfile, HealthMetric, HealthTip, Review } from './types';

export const CURRENT_USER: UserProfile = {
  name: "Sarah",
  healthScore: 82,
  nextRefill: "VitaD3 Complex",
  recommendedFocus: "Sleep Hygiene",
  conditions: ["Stress", "Mild Insomnia", "Seasonal Allergies"]
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    author: 'Emily R.',
    rating: 5,
    date: '2023-10-15',
    comment: 'I noticed a significant difference in my energy levels after just two weeks. Highly recommend!',
    verified: true,
    helpfulCount: 12
  },
  {
    id: 'r2',
    productId: 'p1',
    author: 'Mark T.',
    rating: 4,
    date: '2023-09-22',
    comment: 'Good product, but the capsules are a bit large. Results are great though.',
    verified: true,
    helpfulCount: 5
  },
  {
    id: 'r3',
    productId: 'd1',
    author: 'Jessica L.',
    rating: 5,
    date: '2023-11-05',
    comment: 'Dr. Rostova was incredibly patient and explained everything clearly. The video call quality was perfect.',
    verified: true,
    helpfulCount: 8
  },
  {
    id: 'r4',
    productId: 'p2',
    author: 'David K.',
    rating: 5,
    date: '2023-10-30',
    comment: 'Finally sleeping through the night. This magnesium blend is a game changer.',
    verified: true,
    helpfulCount: 24
  }
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'VitaD3 Complex',
    category: 'Vitamins',
    price: 24.99,
    rating: 4.8,
    reviews: 1240,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
    badges: ['Clinically Proven', 'Doctor Pick'],
    dosage: '1 capsule daily',
    description: "High-potency Vitamin D3 with K2 for optimal absorption and bone health support.",
    ingredients: ["Vitamin D3 (5000 IU)", "Vitamin K2 (100mcg)", "Organic Coconut Oil"],
    benefits: ["Supports immune function", "Promotes bone density", "Mood regulation"],
    warnings: ["Consult doctor if pregnant", "Check calcium levels regularly"],
    science: {
      studyTitle: "Journal of Endocrinology 2023",
      result: "Improved bone density by 15% over 6 months",
      participants: 450
    }
  },
  {
    id: 'p2',
    name: 'NeuroCalm Magnesium',
    category: 'Minerals',
    price: 32.50,
    rating: 4.9,
    reviews: 856,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=400',
    badges: ['Best Seller', 'Sleep Aid'],
    dosage: '2 scoops before bed',
    description: "Bioavailable magnesium bisglycinate to relax muscles and calm the mind for better sleep.",
    ingredients: ["Magnesium Bisglycinate", "L-Theanine", "GABA"],
    benefits: ["Reduces sleep latency", "Muscle relaxation", "Anxiety reduction"],
    warnings: ["May cause drowsiness", "Do not drive after taking"],
    science: {
      studyTitle: "Sleep Medicine Reviews",
      result: "40 mins increased deep sleep duration",
      participants: 120
    }
  },
  {
    id: 'p3',
    name: 'Organic Ashwagandha',
    category: 'Herbal',
    price: 29.99,
    rating: 4.7,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1611073806232-5509539308bb?auto=format&fit=crop&q=80&w=400',
    badges: ['Stress Relief', 'Organic'],
    dosage: '1 capsule morning or night',
    description: "Full-spectrum root extract to help the body adapt to stress and support adrenal function.",
    ingredients: ["KSM-66 Ashwagandha", "Black Pepper Extract"],
    benefits: ["Reduces cortisol levels", "Enhances focus", "Supports energy"],
    warnings: ["Not for pregnant/nursing women", "May interact with thyroid meds"],
    science: {
      studyTitle: "Journal of Alternative Medicine",
      result: "67% reported reduced anxiety",
      participants: 200
    }
  },
  {
    id: 'p4',
    name: 'ImmunoShield Pro',
    category: 'Immunity',
    price: 19.99,
    rating: 4.6,
    reviews: 430,
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd0?auto=format&fit=crop&q=80&w=400',
    badges: ['Seasonal Essential'],
    dosage: '1 tablet daily',
    description: "Comprehensive immune support with Zinc, Vitamin C, and Elderberry.",
    ingredients: ["Zinc Picolinate", "Vitamin C", "Elderberry Extract"],
    benefits: ["Boosts immune response", "Antioxidant protection", "Respiratory health"],
    warnings: ["Take with food to avoid stomach upset"],
    science: {
      studyTitle: "Clinical Immunology Journal",
      result: "Reduced duration of cold symptoms by 2 days",
      participants: 300
    }
  },
  {
    id: 'p5',
    name: 'GutBiome Daily',
    category: 'Probiotics',
    price: 45.00,
    rating: 4.9,
    reviews: 2100,
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=400',
    badges: ['Doctor Pick', 'Gut Health'],
    dosage: '1 capsule on empty stomach',
    description: "50 Billion CFU multi-strain probiotic for optimal digestive and mental health.",
    ingredients: ["Lactobacillus acidophilus", "Bifidobacterium lactis", "Prebiotic Fiber"],
    benefits: ["Improves digestion", "Supports gut-brain axis", "Reduces bloating"],
    warnings: ["Keep refrigerated after opening"],
    science: {
      studyTitle: "Gastroenterology Today",
      result: "90% patient satisfaction for IBS symptoms",
      participants: 1000
    }
  },
  {
    id: 'p6',
    name: 'AllergyDefend',
    category: 'Herbal',
    price: 22.50,
    rating: 4.5,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400',
    badges: ['Non-Drowsy'],
    dosage: '2 capsules as needed',
    description: "Natural histamine support featuring Quercetin and Stinging Nettle.",
    ingredients: ["Quercetin", "Stinging Nettle", "Bromelain"],
    benefits: ["Supports sinus health", "Normal respiratory function", "Seasonal relief"],
    warnings: ["Consult doctor if taking blood thinners"],
    science: {
      studyTitle: "Phytotherapy Research",
      result: "Significant reduction in nasal congestion",
      participants: 150
    }
  },
  {
    id: 'p7',
    name: 'SolarGuard SPF 50',
    category: 'Skincare',
    price: 18.00,
    rating: 4.8,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1556228720-1987eb192454?auto=format&fit=crop&q=80&w=400',
    badges: ['Dermatologist Recommended', 'Mineral'],
    dosage: 'Apply every 2 hours',
    description: "Mineral-based broad spectrum protection suitable for sensitive skin.",
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Aloe Vera"],
    benefits: ["Protects against UVA/UVB", "Reef safe", "Non-comedogenic"],
    warnings: ["For external use only"],
    science: {
      studyTitle: "Dermatology Online",
      result: "98% UV blockage efficacy",
      participants: 200
    }
  },
  {
    id: 'p8',
    name: 'SmartTemp Patch',
    category: 'Devices',
    price: 49.99,
    rating: 4.6,
    reviews: 150,
    image: 'https://images.unsplash.com/photo-1583947581924-860b81d41d7a?auto=format&fit=crop&q=80&w=400',
    badges: ['Tech Choice', 'FDA Cleared'],
    dosage: 'Wear 24h',
    description: "Continuous remote temperature monitoring patch with app integration.",
    ingredients: ["Medical Grade Silicone", "Sensor Array"],
    benefits: ["Real-time alerts", "Comfortable wear", "7-day battery"],
    warnings: ["Remove before MRI"],
    science: {
      studyTitle: "Digital Health Journal",
      result: "High correlation with core temperature",
      participants: 50
    }
  },
  {
    id: 'p9',
    name: 'DeepSleep Melatonin',
    category: 'Vitamins',
    price: 15.99,
    rating: 4.4,
    reviews: 600,
    image: 'https://images.unsplash.com/photo-1543362906-ac1b481287cf?auto=format&fit=crop&q=80&w=400',
    badges: ['Fast Acting'],
    dosage: '1 tablet 30m before bed',
    description: "Time-release melatonin for falling asleep fast and staying asleep.",
    ingredients: ["Melatonin (5mg)", "Chamomile"],
    benefits: ["Regulates sleep cycle", "Improves sleep quality"],
    warnings: ["May cause drowsiness"],
    science: {
      studyTitle: "Sleep Science",
      result: "Reduced time to sleep by 20 mins",
      participants: 300
    }
  }
];

export const AVAILABLE_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Elena Rostova',
    specialty: 'Dermatology',
    rating: 4.9,
    availability: 'Available Today',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    verified: true,
    type: 'telehealth'
  },
  {
    id: 'd2',
    name: 'Dr. James Chen',
    specialty: 'Functional Medicine',
    rating: 4.8,
    availability: 'Next Opening: Tue',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    verified: true,
    type: 'in-person'
  }
];

export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 't1',
    title: "Vitamin D & Sun Exposure",
    content: "How 15 minutes of morning sunlight can boost your immune system naturally.",
    category: "Wellness",
    icon: "sun"
  },
  {
    id: 't2',
    title: "Sleep Hygiene 101",
    content: "Why keeping your room at 65°F is optimal for deep REM cycles.",
    category: "Sleep",
    icon: "moon"
  }
];

export const HEALTH_TREND_DATA: HealthMetric[] = [
  { date: 'Mon', score: 78, label: 'Start' },
  { date: 'Tue', score: 79, label: '' },
  { date: 'Wed', score: 81, label: '' },
  { date: 'Thu', score: 80, label: '' },
  { date: 'Fri', score: 82, label: 'Current' },
];