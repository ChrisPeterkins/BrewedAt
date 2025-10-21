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

// Podcast Episode Types
export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  episodeNumber: number;
  season?: number;
  publishDate: Timestamp;
  duration?: string;
  audioUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  guestName?: string;
  thumbnailUrl?: string;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PodcastFormData {
  title: string;
  description: string;
  episodeNumber: number;
  season: number;
  publishDate: Date | null;
  duration: string;
  audioUrl: string;
  spotifyUrl: string;
  appleUrl: string;
  youtubeUrl: string;
  guestName: string;
  thumbnailUrl: string;
  featured: boolean;
}

// Homepage Content Types
export interface HomePageSection {
  id: string;
  sectionType: 'hero' | 'about' | 'features' | 'cta';
  title: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
  order: number;
  visible: boolean;
  updatedAt: Timestamp;
}

export interface HomePageContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutContent: string;
  statsLabel1: string;
  statsValue1: string;
  statsLabel2: string;
  statsValue2: string;
  statsLabel3: string;
  statsValue3: string;
  updatedAt: Timestamp;
}

// Analytics Types
export interface EventView {
  id: string;
  eventId: string;
  eventName: string;
  timestamp: Timestamp;
  userAgent?: string;
  referrer?: string;
}

export interface EventAnalytics {
  eventId: string;
  eventName: string;
  totalViews: number;
  uniqueViews: number;
  lastViewed?: Timestamp;
}

export interface AnalyticsStats {
  totalEventViews: number;
  totalEvents: number;
  totalPodcastEpisodes: number;
  popularEvents: EventAnalytics[];
}
