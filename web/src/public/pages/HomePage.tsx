import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '@shared/api-client';
import type { Event, PodcastEpisode } from '@shared/api-client';
import EventsCoverflow, { type EventItem } from '../components/EventsCoverflow';

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
    canColor: '#2d4a3e',
    accentColor: '#fbbf24',
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
    canColor: '#3d2a1f',
    accentColor: '#d97706',
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
    canColor: '#3b2d5a',
    accentColor: '#7c3aed',
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
    canColor: '#1e3a5f',
    accentColor: '#2563eb',
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
    canColor: '#4a1f1f',
    accentColor: '#ef4444',
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
    canColor: '#004c54',
    accentColor: '#a5acaf',
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
    canColor: '#4a3728',
    accentColor: '#8b5cf6',
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
    canColor: '#4a2d4a',
    accentColor: '#ec4899',
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
  const [formMessage, setFormMessage] = useState('');
  const [podcastCarouselIndex, setPodcastCarouselIndex] = useState(0);

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
    if (!email ||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormMessage('Please enter a valid email address');
      return;
    }
    setSubmitting(true);
    setFormMessage('');
    setTimeout(() => {
      setFormMessage('Thanks for signing up! We\'ll keep you updated.');
      setEmail('');
      setSubmitting(false);
      setTimeout(() => setFormMessage(''), 3000);
    }, 1000);
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
              <a
                href="/brewedat/events"
                className="current-event-details-card"
                style={{
                  backgroundColor: currentEvent.canColor || '#1f3540',
                  transition: 'background-color 0.4s ease',
                  textDecoration: 'none',
                  display: 'block'
                }}
              >
                <div
                  className="featured-banner"
                  style={{ backgroundColor: currentEvent.accentColor || '#fd5526' }}
                >
                  Featured Event
                </div>
                <div className="current-event-header">
                  <h3 className="current-event-title">{currentEvent.title}</h3>
                  {/* Event Tags - moved to top */}
                  <div className="current-event-tags">
                    {currentEvent.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="event-tag"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="current-event-meta">
                    <div className="current-event-date">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{currentEvent.date}</span>
                    </div>
                    <div className="current-event-location">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{currentEvent.location}</span>
                    </div>
                  </div>
                </div>

                <p className="current-event-description">
                  {currentEvent.description}
                </p>

                {/* Location Map */}
                <div className="current-event-map">
                  <div className="map-container">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(currentEvent.location)}&output=embed&z=14`}
                      width="100%"
                      height="180"
                      style={{ border: 0, borderRadius: '8px' }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${currentEvent.location}`}
                    />
                  </div>
                </div>
              </a>
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
            <a href="/brewedat/get-involved" className="btn-large btn-secondary">Submit an Event</a>
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

      {/* Business CTA */}
      <section style={{
        padding: '80px 0',
        background: 'white'
      }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #1f3540 0%, #25303d 100%)',
            padding: '60px 40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '1rem'
            }}>
              Partner with BrewedAt
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#b8c5d0',
              marginBottom: '2rem',
              lineHeight: '1.8',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Reach 10,000+ craft beer enthusiasts and 765+ brewery decision-makers through our podcast, social media, and event network. Flexible retainer packages starting at $1,000/month.
            </p>
            <div className="business-cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/brewedat/for-business#packages"
                className="business-cta-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: '#fd5526',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(253, 85, 38, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View Retainer Packages
              </a>
              <a
                href="mailto:info@brewedat.com"
                className="business-cta-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#1f3540';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section id="signup" className="email-signup">
        <div className="container">
          <div className="signup-content">
            <h2>Stay Connected</h2>
            <p>Get updates about upcoming events, community news, and the latest from the craft beer scene.</p>
            <form className="signup-form" onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" required />
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
              {formMessage && <p className={`form-message ${formMessage.includes('Thanks') ? 'success' : 'error'}`}>{formMessage}</p>}
            </form>
            <p className="privacy-note">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
