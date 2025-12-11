import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '@shared/api-client';
import type { Event, PodcastEpisode } from '@shared/api-client';
import EventsCoverflow, { type EventItem } from '../components/EventsCoverflow';

// Fun on-brand success messages
const successMessages = [
  "Cheers! You're on the list",
  "Great pour decision.",
  "Welcome to the crew — first round's on us (metaphorically)",
  "You're in. No ID required.",
  "Tapped in and ready to go.",
  "Consider yourself a regular now.",
  "The best email we've gotten all day.",
];

const errorMessages = [
  "Whoa, something spilled. Try again?",
  "That didn't pour right. One more shot?",
  "Hmm, hit a snag. Give it another go.",
];

// Toast notification components
const BeerMugIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M6 10C6 8.89543 6.89543 8 8 8H20C21.1046 8 22 8.89543 22 10V26C22 27.1046 21.1046 28 20 28H8C6.89543 28 6 27.1046 6 26V10Z"
      fill="#D4A03E"
    />
    <path
      d="M8 12H20V24C20 25.1046 19.1046 26 18 26H10C8.89543 26 8 25.1046 8 24V12Z"
      fill="#F5B041"
    />
    <ellipse cx="10" cy="11" rx="2.5" ry="2" fill="#FFF8E7"/>
    <ellipse cx="14" cy="10" rx="3" ry="2.5" fill="#FFF8E7"/>
    <ellipse cx="18" cy="11" rx="2.5" ry="2" fill="#FFF8E7"/>
    <ellipse cx="12" cy="9" rx="2" ry="1.5" fill="#FFFDF5"/>
    <ellipse cx="16" cy="9" rx="2" ry="1.5" fill="#FFFDF5"/>
    <path
      d="M22 12H24C25.6569 12 27 13.3431 27 15V19C27 20.6569 25.6569 22 24 22H22"
      stroke="#D4A03E"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <g transform="rotate(-20 16 20)">
      <path
        d="M8 14C8 12.8954 8.89543 12 10 12H22C23.1046 12 24 12.8954 24 14V26C24 27.1046 23.1046 28 22 28H10C8.89543 28 8 27.1046 8 26V14Z"
        fill="#D4A03E"
      />
    </g>
    <circle cx="7" cy="24" r="2" fill="#F5B041" opacity="0.8"/>
    <circle cx="10" cy="27" r="1.5" fill="#F5B041" opacity="0.6"/>
    <circle cx="5" cy="28" r="1" fill="#F5B041" opacity="0.4"/>
  </svg>
);

const Bubble = ({ delay, left, size }: { delay: number; left: number; size: number }) => (
  <div
    style={{
      position: 'absolute',
      bottom: -10,
      left: `${left}%`,
      width: size,
      height: size,
      background: 'rgba(212, 160, 62, 0.6)',
      borderRadius: '50%',
      animation: `bubbleRise 2s ease-out ${delay}s forwards`,
    }}
  />
);

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  const [bubbleKey, setBubbleKey] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setBubbleKey(prev => prev + 1);
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        minWidth: 320,
        maxWidth: 420,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        background: type === 'success'
          ? 'linear-gradient(135deg, #1a2f1a 0%, #0d1f0d 100%)'
          : 'linear-gradient(135deg, #2f1a1a 0%, #1f0d0d 100%)',
        borderLeft: `4px solid ${type === 'success' ? '#D4A03E' : '#fd5526'}`,
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        zIndex: 9999,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', position: 'relative' }}>
        <div style={{
          flexShrink: 0,
          animation: isVisible ? 'iconPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' : 'none',
        }}>
          {type === 'success' ? <BeerMugIcon /> : <ErrorIcon />}
        </div>
        <p style={{
          flex: 1,
          margin: 0,
          color: '#fff',
          fontSize: '0.95rem',
          fontWeight: 500,
          lineHeight: 1.4,
          animation: isVisible ? 'messageSlide 0.4s ease 0.1s both' : 'none',
        }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M12.2 3.8L3.8 12.2M3.8 3.8L12.2 12.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {type === 'success' && isVisible && (
        <div key={bubbleKey} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
          <Bubble delay={0} left={10} size={6} />
          <Bubble delay={0.2} left={25} size={4} />
          <Bubble delay={0.4} left={40} size={8} />
          <Bubble delay={0.1} left={60} size={5} />
          <Bubble delay={0.3} left={75} size={6} />
          <Bubble delay={0.5} left={90} size={4} />
        </div>
      )}
    </div>
  );
};

// Placeholder event data with tags
const PLACEHOLDER_EVENTS: EventItem[] = [
  {
    id: 'event-1',
    image: '/brewedat/uploads/general/passportevent.jpeg',
    title: 'Beer Passport Event',
    date: 'Dec 15, 2025',
    location: 'Center City, Philadelphia',
    description: 'Explore the best craft breweries in Philadelphia with our exclusive Beer Passport. Visit multiple locations and collect stamps for special prizes!',
    tags: [
      { name: 'Brewery Crawl', color: '#14B8A6', category: 'activity' },
      { name: 'Craft Beer', color: '#F59E0B', category: 'beverages' },
      { name: 'Dog Friendly', color: '#16A34A', category: 'activity' },
    ],
    canImage: '/brewedat/uploads/general/testevent-1765417106825-549704247.png',
    canColor: '#1f3540',
    accentColor: '#fd5526',
    breweryName: 'BrewedAt',
    beerStyle: 'PASSPORT'
  },
  {
    id: 'event-2',
    image: '/brewedat/uploads/general/testevent-1764112766587-547516293.png',
    title: 'Test Brewery Crawl',
    date: 'Dec 20, 2025',
    location: 'Fishtown, Philadelphia',
    description: 'Join us for an epic brewery crawl through Fishtown\'s finest craft beer spots. Sample unique brews and meet fellow beer enthusiasts.',
    tags: [
      { name: 'Live Music', color: '#9333EA', category: 'entertainment' },
      { name: 'IPA', color: '#FBBF24', category: 'beverages' },
      { name: 'Food Truck', color: '#022C22', category: 'activity' },
    ],
    canImage: '/brewedat/uploads/general/IMG_5279-1765478448365-728673072.jpeg',
    canColor: '#654321',
    accentColor: '#D4A03E',
    breweryName: 'Fishtown',
    beerStyle: 'CRAWL'
  },
  {
    id: 'event-3',
    image: '/brewedat/uploads/general/passportevent.jpeg',
    title: 'Beer Passport Event',
    date: 'Dec 22, 2025',
    location: 'Center City, Philadelphia',
    description: 'Explore the best craft breweries in Philadelphia with our exclusive Beer Passport. Visit multiple locations and collect stamps for special prizes!',
    tags: [
      { name: 'Tasting', color: '#3B82F6', category: 'event-focus' },
      { name: 'Stout', color: '#D97706', category: 'beverages' },
      { name: 'Meet the Brewer', color: '#312E81', category: 'event-focus' },
    ],
    canImage: '/brewedat/uploads/general/IMG_5281-1765478448531-767674974.jpeg',
    canColor: '#8B4513',
    accentColor: '#fd5526',
    breweryName: 'BrewedAt',
    beerStyle: 'STOUT'
  },
  {
    id: 'event-4',
    image: '/brewedat/uploads/general/testevent-1764112766587-547516293.png',
    title: 'Test Brewery Crawl',
    date: 'Dec 28, 2025',
    location: 'Fishtown, Philadelphia',
    description: 'Join us for an epic brewery crawl through Fishtown\'s finest craft beer spots. Sample unique brews and meet fellow beer enthusiasts.',
    tags: [
      { name: 'Trivia', color: '#7C3AED', category: 'entertainment' },
      { name: 'Sour', color: '#92400E', category: 'beverages' },
      { name: 'Family Friendly', color: '#22C55E', category: 'activity' },
    ],
    canImage: '/brewedat/uploads/general/IMG_5280-1765478450052-862386541.jpeg',
    canColor: '#1f3540',
    accentColor: '#D4A03E',
    breweryName: 'Fishtown',
    beerStyle: 'SOUR'
  },
  {
    id: 'event-5',
    image: '/brewedat/uploads/general/passportevent.jpeg',
    title: 'Beer Passport Event',
    date: 'Jan 5, 2026',
    location: 'Center City, Philadelphia',
    description: 'Explore the best craft breweries in Philadelphia with our exclusive Beer Passport. Visit multiple locations and collect stamps for special prizes!',
    tags: [
      { name: 'Release Party', color: '#2563EB', category: 'event-focus' },
      { name: 'Lager', color: '#B45309', category: 'beverages' },
      { name: 'Outdoor', color: '#15803D', category: 'activity' },
    ],
    canImage: '/brewedat/uploads/general/testevent-1765417106825-549704247.png',
    canColor: '#654321',
    accentColor: '#fd5526',
    breweryName: 'BrewedAt',
    beerStyle: 'LAGER'
  },
  {
    id: 'event-6',
    image: '/brewedat/uploads/general/testevent-1764112766587-547516293.png',
    title: 'Test Brewery Crawl',
    date: 'Jan 10, 2026',
    location: 'Fishtown, Philadelphia',
    description: 'Join us for an epic brewery crawl through Fishtown\'s finest craft beer spots. Sample unique brews and meet fellow beer enthusiasts.',
    tags: [
      { name: 'Mario Kart', color: '#EF4444', category: 'video-games' },
      { name: 'Craft Beer', color: '#F59E0B', category: 'beverages' },
      { name: 'DJ', color: '#A855F7', category: 'entertainment' },
    ],
    canImage: '/brewedat/uploads/general/IMG_5279-1765478448365-728673072.jpeg',
    canColor: '#8B4513',
    accentColor: '#D4A03E',
    breweryName: 'Fishtown',
    beerStyle: 'GAMING'
  },
  {
    id: 'event-7',
    image: '/brewedat/uploads/general/passportevent.jpeg',
    title: 'Beer Passport Event',
    date: 'Jan 15, 2026',
    location: 'Center City, Philadelphia',
    description: 'Explore the best craft breweries in Philadelphia with our exclusive Beer Passport. Visit multiple locations and collect stamps for special prizes!',
    tags: [
      { name: 'Watch Party', color: '#F97316', category: 'sports' },
      { name: 'Eagles', color: '#065F46', category: 'sports' },
      { name: 'Cocktails', color: '#10B981', category: 'beverages' },
    ],
    canImage: '/brewedat/uploads/general/IMG_5281-1765478448531-767674974.jpeg',
    canColor: '#1f3540',
    accentColor: '#fd5526',
    breweryName: 'BrewedAt',
    beerStyle: 'EAGLES'
  },
  {
    id: 'event-8',
    image: '/brewedat/uploads/general/testevent-1764112766587-547516293.png',
    title: 'Test Brewery Crawl',
    date: 'Jan 20, 2026',
    location: 'Fishtown, Philadelphia',
    description: 'Join us for an epic brewery crawl through Fishtown\'s finest craft beer spots. Sample unique brews and meet fellow beer enthusiasts.',
    tags: [
      { name: 'Karaoke', color: '#8B5CF6', category: 'entertainment' },
      { name: 'Cider', color: '#78350F', category: 'beverages' },
      { name: 'Bingo', color: '#134E4A', category: 'activity' },
    ],
    canImage: '/brewedat/uploads/general/IMG_5280-1765478450052-862386541.jpeg',
    canColor: '#654321',
    accentColor: '#D4A03E',
    breweryName: 'Fishtown',
    beerStyle: 'CIDER'
  },
  {
    id: 'event-9',
    image: '/brewedat/uploads/general/passportevent.jpeg',
    title: 'Beer Passport Event',
    date: 'Jan 25, 2026',
    location: 'Center City, Philadelphia',
    description: 'Explore the best craft breweries in Philadelphia with our exclusive Beer Passport. Visit multiple locations and collect stamps for special prizes!',
    tags: [
      { name: 'Charity Event', color: '#EC4899', category: 'event-focus' },
      { name: 'Non-Alcoholic', color: '#6B7280', category: 'beverages' },
      { name: 'Yoga', color: '#0F766E', category: 'activity' },
    ],
    canImage: '/brewedat/uploads/general/testevent-1765417106825-549704247.png',
    canColor: '#8B4513',
    accentColor: '#fd5526',
    breweryName: 'BrewedAt',
    beerStyle: 'WELLNESS'
  },
];

interface SocialMediaStats {
  instagram?: { followers: number };
  facebook?: { followers: number };
  twitter?: { followers: number };
  youtube?: { subscribers: number };
}

export default function HomePage() {
  const [socialStats, setSocialStats] = useState<SocialMediaStats | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const [featuredEpisodes, setFeaturedEpisodes] = useState<PodcastEpisode[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventItem>(PLACEHOLDER_EVENTS[0]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [totalFollowers, setTotalFollowers] = useState('15,000+');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; type: 'success' | 'error'; message: string }>({ isVisible: false, type: 'success', message: '' });
  const [podcastCarouselIndex, setPodcastCarouselIndex] = useState(0);

  const showToast = (type: 'success' | 'error', customMessage?: string) => {
    const messages = type === 'success' ? successMessages : errorMessages;
    const message = customMessage || messages[Math.floor(Math.random() * messages.length)];
    setToast({ isVisible: true, type, message });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  useEffect(() => {
    // loadSocialStats(); // Commented out - not using social stats API
    loadFeaturedEvents();
    loadFeaturedEpisodes();
  }, []);

  // Handler for when coverflow carousel changes
  const handleEventChange = (event: EventItem, index: number) => {
    setCurrentEvent(event);
    setCurrentEventIndex(index);
  };

  const loadSocialStats = async () => {
    try {
      const response = await apiClient.getConfigValue('socialMedia');
      if (response.success && response.data) {
        const data = JSON.parse(response.data.value) as SocialMediaStats;
        setSocialStats(data);
        const total = (data.instagram?.followers || 0) + (data.facebook?.followers || 0) + (data.twitter?.followers || 0) + (data.youtube?.subscribers || 0);
        if (total > 0) {
          setTotalFollowers(total.toLocaleString() + '+');
        }
      }
    } catch (error) {
      console.error('Error loading social stats:', error);
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      const response = await apiClient.getEvents();
      if (response.success && response.data) {
        const now = new Date();
        // Filter to only show upcoming events
        const upcomingEvents = response.data.filter(event => new Date(event.date) >= now);

        // Show first event as featured, rest in carousel
        if (upcomingEvents.length > 0) {
          setFeaturedEvents([upcomingEvents[0]]);
          setOtherEvents(upcomingEvents.slice(1));
        } else {
          setFeaturedEvents([]);
          setOtherEvents([]);
        }
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
    }
  };

  const loadFeaturedEpisodes = async () => {
    try {
      // Try to get featured episodes first
      let response = await apiClient.getPodcastEpisodes({ featured: true, limit: 3 });

      if (response.success && response.data && response.data.length > 0) {
        setFeaturedEpisodes(response.data);
      } else {
        // Fall back to latest episodes
        response = await apiClient.getPodcastEpisodes({ limit: 3 });
        if (response.success && response.data) {
          setFeaturedEpisodes(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading featured episodes:', error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('error', "That email doesn't look quite right. Try again?");
      return;
    }
    setSubmitting(true);

    try {
      const response = await apiClient.subscribe(email);

      if (response.success) {
        showToast('success');
        setEmail('');
      } else {
        showToast('error', response.error || undefined);
      }
    } catch (error) {
      showToast('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>BrewedAt | Local Beer Events & Happenings</title>
        <meta name="description" content="Tap into the local craft beverage scene. Discover events, podcasts, and connect with the craft beer community in PA & NJ." />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chrispeterkins.com/brewedat/" />
        <meta property="og:title" content="BrewedAt | Local Beer Events & Happenings" />
        <meta property="og:description" content="Tap into the local craft beverage scene. Discover events, podcasts, and connect with the craft beer community in PA & NJ." />
        <meta property="og:image" content="https://chrispeterkins.com/brewedat/beer-background-optimized.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://chrispeterkins.com/brewedat/" />
        <meta name="twitter:title" content="BrewedAt | Local Beer Events & Happenings" />
        <meta name="twitter:description" content="Tap into the local craft beverage scene. Discover events, podcasts, and connect with the craft beer community in PA & NJ." />
        <meta name="twitter:image" content="https://chrispeterkins.com/brewedat/beer-background-optimized.jpg" />

        {/* Social Media Embed Scripts */}
        <script async src="//www.instagram.com/embed.js"></script>
        <script async src="https://www.tiktok.com/embed.js"></script>
      </Helmet>

      <div>
        {/* Hero Section */}
        <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <img
              src="/brewedat/uploads/general/smaller logo-1764111844469-980589512.png"
              alt="BrewedAt Logo"
              className="hero-logo"
            />
            <h1>
              <span className="hero-title-mobile">Tap into the Craft Beverage Scene</span>
              <span className="hero-title-desktop">Tap into the Local<br className="hero-title-break" />Craft Beverage Scene</span>
            </h1>
            <div className="hero-cta">
              <a href="#events" className="btn-large btn-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Events
              </a>
              <a href="#podcast" className="btn-large btn-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14V18M12 18H8M12 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Podcast
              </a>
              <a href="#social" className="btn-large btn-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Social
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="events-highlight">
        <div className="container">
          <div className="events-header">
            <h2>Find Events Near You</h2>
            <p>From pop-ups to brewery crawls and festivals, discover fun new ways to explore the craft beverage scene in PA and NJ.</p>
          </div>

          {/* Side-by-side layout: Carousel left, Details right */}
          <div className="events-split-layout">
            <div className="events-unified-container">
              {/* Left side - Carousel */}
              <div className="events-carousel-side">
                <EventsCoverflow
                  events={PLACEHOLDER_EVENTS}
                  onEventChange={handleEventChange}
                  autoplayDelay={8000}
                  externalPagination={true}
                />
              </div>

              {/* Right side - Event Details */}
              <div className="events-details-side">
              <div className="event-details-card-new">
                {/* Top Section */}
                <div className="event-details-top">
                  {/* Beer Style Tag */}
                  {currentEvent.beerStyle && (
                    <span
                      className="event-style-tag"
                      style={{
                        background: `${currentEvent.canColor || '#1f3540'}20`,
                        color: currentEvent.canColor || '#1f3540'
                      }}
                    >
                      {currentEvent.beerStyle}
                    </span>
                  )}

                  {/* Event Name */}
                  <h3 className="event-details-title">{currentEvent.title}</h3>

                  {/* Brewery Name */}
                  {currentEvent.breweryName && (
                    <p className="event-details-brewery">{currentEvent.breweryName}</p>
                  )}
                </div>

                {/* Description */}
                <p className="event-details-description">
                  {currentEvent.description}
                </p>

                {/* Highlights/Tags */}
                <div className="event-details-highlights">
                  {currentEvent.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="event-highlight-tag"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div className="event-details-divider" />

                {/* Details Grid */}
                <div className="event-details-grid">
                  {/* Date & Time */}
                  <div className="event-detail-item">
                    <p className="event-detail-label">Date & Time</p>
                    <p className="event-detail-value">{currentEvent.date}</p>
                    <p className="event-detail-subvalue">Time TBA</p>
                  </div>

                  {/* Location */}
                  <div className="event-detail-item">
                    <p className="event-detail-label">Location</p>
                    <p className="event-detail-value">{currentEvent.location}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentEvent.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-detail-link"
                    >
                      View on map
                    </a>
                  </div>
                </div>

                {/* Bottom CTA Section */}
                <div className="event-details-cta">
                  {/* Price & Availability */}
                  <div className="event-price-info">
                    <p className="event-price">
                      Free
                      <span className="event-price-note">to attend</span>
                    </p>
                    <p className="event-availability">Open to all</p>
                  </div>

                  {/* CTA Button */}
                  <a href="/brewedat/events" className="event-cta-button">
                    View Details
                  </a>
                </div>
              </div>
            </div>
            </div>

            {/* External Pagination Dots */}
            <div className="events-pagination">
              {PLACEHOLDER_EVENTS.map((_, index) => (
                <span
                  key={index}
                  className={`pagination-dot ${index === currentEventIndex ? 'active' : ''}`}
                  style={{
                    backgroundColor: index === currentEventIndex
                      ? '#fd5526'
                      : 'rgba(253, 85, 38, 0.3)'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="events-button-group">
            <a href="/brewedat/events" className="btn-large btn-primary">View All Events</a>
            <p className="submit-event-link">
              Have an event to share? <a href="/brewedat/submit-event">Submit it here</a>
            </p>
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section
        id="podcast"
        className="podcast-highlight"
        style={{
          position: 'relative',
          background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/brewedat/api/uploads/general/PodcastBackground2-1762980833203-514936744.jpeg) center/cover no-repeat'
        }}
      >
        <div className="container">
          <div className="podcast-header">
            <h2>Listen to the Experts</h2>
            <p>The BrewedAt Podcast explores Philly's craft beverage, bar, and culture scene through unfiltered conversations with the founders and leaders shaping it.</p>
          </div>

          {/* Featured Episodes - YouTube Embeds */}
          <div className="podcast-carousel-wrapper">
            {/* Carousel Navigation - Mobile Only */}
            {featuredEpisodes.length > 1 && (
              <>
                <button
                  className="podcast-carousel-nav podcast-carousel-prev"
                  onClick={() => setPodcastCarouselIndex(Math.max(0, podcastCarouselIndex - 1))}
                  disabled={podcastCarouselIndex === 0}
                  aria-label="Previous episode"
                >
                  ‹
                </button>
                <button
                  className="podcast-carousel-nav podcast-carousel-next"
                  onClick={() => setPodcastCarouselIndex(Math.min(featuredEpisodes.length - 1, podcastCarouselIndex + 1))}
                  disabled={podcastCarouselIndex === featuredEpisodes.length - 1}
                  aria-label="Next episode"
                >
                  ›
                </button>
              </>
            )}

            <div
              className="podcast-episodes-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
              }}
            >
              {featuredEpisodes.length > 0 ? (
                featuredEpisodes.map((episode, index) => {
                // Extract YouTube video ID from URL
                const getYouTubeId = (url: string | undefined) => {
                  if (!url) return null;
                  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                  return match ? match[1] : null;
                };

                const videoId = getYouTubeId(episode.youtubeUrl);

                return (
                  <div
                    key={episode.id}
                    className={`podcast-episode-card ${index === podcastCarouselIndex ? 'active' : ''}`}
                    style={{
                      background: '#1f3540',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {videoId ? (
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={episode.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        background: 'linear-gradient(135deg, #FD5526 0%, #E04515 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="white" style={{ position: 'absolute' }}>
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#fff',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4'
                      }}>
                        {episode.title}
                      </h3>
                      {episode.description && (
                        <p style={{
                          fontSize: '13px',
                          color: '#b8c5d0',
                          margin: '0 0 12px 0',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {episode.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {episode.spotifyUrl && (
                          <a
                            href={episode.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: '#1DB954',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderRadius: '20px',
                              textDecoration: 'none',
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            Spotify
                          </a>
                        )}
                        {episode.appleUrl && (
                          <a
                            href={episode.appleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: '#A561E8',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderRadius: '20px',
                              textDecoration: 'none',
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            Apple
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#b8c5d0' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 20px', opacity: 0.3 }}>
                  <rect x="9" y="3" width="6" height="11" rx="3"/>
                  <path d="M12 14V18M12 18H8M12 18H16" strokeLinecap="round"/>
                  <path d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11" strokeLinecap="round"/>
                </svg>
                <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>New Episodes Coming Soon</h3>
                <p>Join us for in-depth conversations with brewery owners, bar operators, and craft beer innovators.</p>
              </div>
            )}
            </div>
          </div>

          {/* Podcast Platforms */}
          <div className="podcast-platforms-section">
            <span>Listen on:</span>
            <div className="platform-badges">
              <a href="https://open.spotify.com/show/6CKeuqsJyF097FHhX4CCZH" target="_blank" rel="noopener noreferrer" className="badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Spotify
              </a>
              <a href="https://podcasts.apple.com/us/podcast/the-brewedat-podcast/id1234567890" target="_blank" rel="noopener noreferrer" className="badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.271 17.728c-.195.281-.566.379-.848.195-2.28-1.402-5.148-1.719-8.522-0.941-.338.078-.656-.15-.734-.488-.078-.338.15-.656.488-.734 3.701-.852 6.826-.486 9.375 1.086.281.172.379.567.195.848l.046.034zm1.171-2.602c-.242.393-.758.516-1.148.281-2.609-1.605-6.582-2.07-9.668-1.133-.398.117-.82-.109-.938-.508-.117-.398.109-.82.508-.938 3.531-1.078 7.926-.555 10.969 1.289.39.242.516.758.281 1.148l-.004-.139zm.102-2.71c-3.129-1.859-8.289-2.031-11.277-1.125-.477.141-.984-.133-1.125-.609-.141-.477.133-.984.609-1.125 3.437-1.043 9.113-.844 12.738 1.301.453.266.602.847.336 1.301-.266.453-.847.602-1.301.336l.02-.079z"/></svg>
                Apple Podcasts
              </a>
              <a href="https://www.youtube.com/@brewedat" target="_blank" rel="noopener noreferrer" className="badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YouTube
              </a>
            </div>
          </div>

          <div className="podcast-cta">
            <a href="/brewedat/podcast" className="btn-large btn-primary">View All Episodes</a>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section id="social" className="instagram-feed-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Follow Our Journey</h2>
            <p>Stay connected with the latest brewery visits, event highlights, and craft beer community moments</p>

            {/* Compact Social Buttons */}
            <div className="social-buttons-compact">
              <a
                href="https://www.instagram.com/brewedat/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button-compact instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                </svg>
                @brewedat
              </a>

              <a
                href="https://www.tiktok.com/@brewedat"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button-compact tiktok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                @brewedat
              </a>

              <a
                href="https://www.instagram.com/thebrewedatpodcast/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button-compact instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                </svg>
                @thebrewedatpodcast
              </a>

              <a
                href="https://www.tiktok.com/@thebrewedatpodcast"
                target="_blank"
                rel="noopener noreferrer"
                className="social-button-compact tiktok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                @thebrewedatpodcast
              </a>
            </div>
          </div>

          {/* Social Content Grid - Static TikTok Feeds */}
          <div className="social-content-grid">
            <div className="social-feed-card">
              <div className="social-feed-header tiktok-theme">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>@brewedat</span>
              </div>
              <div className="social-feed-embed">
                <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@brewedat" data-unique-id="brewedat" data-embed-type="creator" style={{maxWidth: '780px', minWidth: '288px'}}>
                  <section>
                    <a target="_blank" href="https://www.tiktok.com/@brewedat?refer=creator_embed">@brewedat</a>
                  </section>
                </blockquote>
              </div>
            </div>

            <div className="social-feed-card">
              <div className="social-feed-header tiktok-theme">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>@thebrewedatpodcast</span>
              </div>
              <div className="social-feed-embed">
                <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@thebrewedatpodcast" data-unique-id="thebrewedatpodcast" data-embed-type="creator" style={{maxWidth: '780px', minWidth: '288px'}}>
                  <section>
                    <a target="_blank" href="https://www.tiktok.com/@thebrewedatpodcast?refer=creator_embed">@thebrewedatpodcast</a>
                  </section>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section id="signup" className="email-signup">
        <div className="container">
          <div className="signup-content">
            <h2>Stay Connected</h2>
            <p>Get updates about upcoming events, community news, and the latest from the craft beer scene.</p>
            <form className="signup-form" onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </form>
            <p className="privacy-note">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
      </div>

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}
