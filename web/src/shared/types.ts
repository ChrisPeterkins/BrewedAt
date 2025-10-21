import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: Timestamp;
  photoURL?: string;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  description: string;
  eventDate: Timestamp;
  eventTime?: string;
  location: string;
  address: string;
  eventType: 'brewedat' | 'local';
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  websiteUrl?: string;
  ticketUrl?: string;
  imageUrl?: string;
  approved: boolean;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventFormData {
  name: string;
  description: string;
  eventDate: Date | null;
  eventTime: string;
  location: string;
  address: string;
  eventType: 'brewedat' | 'local';
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  websiteUrl: string;
  ticketUrl: string;
  imageUrl: string;
  approved: boolean;
  featured: boolean;
}

// Social Media Types
export interface SocialPlatform {
  handle: string;
  followers?: number;
  subscribers?: number;
}

export interface SocialMediaStats {
  instagram: SocialPlatform;
  facebook: SocialPlatform;
  twitter: SocialPlatform;
  youtube: SocialPlatform;
}

// Site Content Types
export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
}

export interface SiteContent {
  hero: HeroContent;
  aboutTitle: string;
  aboutDescription: string;
  updatedAt: Timestamp;
}

// Raffle Types
export interface Raffle {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  winnerId?: string;
  createdAt: Timestamp;
}

export interface RaffleEntry {
  id: string;
  raffleId: string;
  userId: string;
  userName: string;
  userEmail: string;
  enteredAt: Timestamp;
}

// Check-in Types
export interface CheckIn {
  id: string;
  userId: string;
  eventId: string;
  timestamp: Timestamp;
  points: number;
}

// Data Management Types
export interface DataLog {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  time: string;
}
