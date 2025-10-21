import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@shared/firebase.config';
import type { SocialMediaStats, Event } from '@shared/types';

export default function HomePage() {
  const [socialStats, setSocialStats] = useState<SocialMediaStats | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalFollowers, setTotalFollowers] = useState('15,000+');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      title: 'Gaming Tournaments',
      desc: 'Mario Kart & Smash Bros at Local Breweries',
      gradient: 'linear-gradient(135deg, #D4922A 0%, #8B4513 100%)'
    },
    {
      title: 'Crafted in Philly',
      desc: '11 Breweries, 2 Months of Craft Beer Tours',
      gradient: 'linear-gradient(135deg, #654321 0%, #D4922A 100%)'
    },
    {
      title: 'Brewery Partnerships',
      desc: 'Connecting Communities Across PA & NJ',
      gradient: 'linear-gradient(135deg, #8B4513 0%, #654321 100%)'
    },
    {
      title: 'Live Events',
      desc: 'Year-Round Activations & Experiences',
      gradient: 'linear-gradient(135deg, #D4922A 0%, #654321 100%)'
    },
    {
      title: 'Local Taprooms',
      desc: 'Supporting Craft Beer Culture',
      gradient: 'linear-gradient(135deg, #654321 0%, #8B4513 100%)'
    }
  ];

  useEffect(() => {
    loadSocialStats();
    loadFeaturedEvents();
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const loadSocialStats = async () => {
    try {
      const docRef = doc(db, 'siteConfig', 'socialMedia');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SocialMediaStats;
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
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('approved', '==', true),
        where('featured', '==', true),
        orderBy('eventDate', 'asc'),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setFeaturedEvents(events);
    } catch (error) {
      console.error('Error loading featured events:', error);
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    stopAutoplay();
    startAutoplay();
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
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Tap into the Local Craft Beverage Scene</h1>
            <p className="hero-subtitle">
              Something's always brewing in the craft beverage scene. Stay up to date on unforgettable events, local stories, and interactive campaigns that help you discover your next favorite brewery, beverage, or bar!
            </p>
            <div className="hero-cta">
              <a href="#events" className="btn-large btn-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Events
              </a>
              <a href="#podcast" className="btn-large btn-secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  <path d="M12 4V8M12 16V20M4 12H8M16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Podcast
              </a>
              <a href="#social" className="btn-large btn-secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Social
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{totalFollowers}</span>
                <span className="stat-label">Community Members</span>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div className="hero-carousel">
            <div className="carousel-container">
              <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * (33.333 + 2)}%)` }}>
                {slides.map((slide, idx) => (
                  <div key={idx} className="carousel-slide">
                    <div className="carousel-image" style={{ background: slide.gradient }}>
                      <div className="carousel-overlay">
                        <h3>{slide.title}</h3>
                        <p>{slide.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-button carousel-button-prev" onClick={prevSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="carousel-button carousel-button-next" onClick={nextSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="carousel-dots">
                {slides.map((_, idx) => (
                  <div key={idx} className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(idx)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="events-highlight">
        <div className="container">
          <div className="content-split">
            <div className="content-text">
              <h2>Craft Beer Events Across PA & NJ</h2>
              <p>From gaming tournaments at local breweries to brewery crawls and beer festivals, we bring the craft beer community together through unforgettable experiences. Whether you're a casual drinker or a seasoned enthusiast, there's always something happening at BrewedAt.</p>
              <ul className="highlight-list">
                <li>Gaming tournaments (Mario Kart, Super Smash Bros)</li>
                <li>Brewery tours and crawls</li>
                <li>Beer festivals and tastings</li>
                <li>Community meetups</li>
              </ul>
              <a href="/events" className="btn-large btn-primary">View All Events</a>
            </div>
            <div className="content-visual">
              {featuredEvents.length > 0 ? (
                <div className="featured-events-list">
                  {featuredEvents.map((event) => (
                    <a key={event.id} href="/events" className="featured-event-card">
                      <div className="featured-event-date">
                        <span className="month">{event.eventDate.toDate().toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="day">{event.eventDate.toDate().getDate()}</span>
                      </div>
                      <div className="featured-event-info">
                        <h4>{event.name}</h4>
                        <div className="event-meta">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="visual-placeholder" style={{ background: 'linear-gradient(135deg, #D4922A 0%, #8B4513 100%)' }}>
                  <div className="placeholder-text">
                    <h3>Upcoming Events</h3>
                    <p>Check out what's happening this month</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section id="podcast" className="podcast-highlight">
        <div className="container">
          <div className="content-split reverse">
            <div className="content-visual">
              <div className="podcast-embed">
                <iframe width="100%" height="400" style={{ borderRadius: '12px' }} src="https://www.youtube.com/embed/qrZ15CiM0R8" title="The BrewedAt Podcast" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
              </div>
            </div>
            <div className="content-text">
              <h2>The BrewedAt Podcast</h2>
              <p>An exploration of the movers and shakers in the Greater Philadelphia Area beer, bar and culture space. Join us as we sit down with brewery owners, bar operators, and community leaders for honest, in-depth conversations about what makes the local craft beer scene special.</p>
              <div className="latest-episode">
                <h4>Latest Episode</h4>
                <p className="episode-title">#60 - BGS Beverage Consultants (John Stemler)</p>
                <p className="episode-description">Hosted by Richie Tevlin, Owner and Brewmaster of Space Cadet Brewing Company</p>
              </div>
              <div className="podcast-platforms">
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
                  <a href="https://thebrewedatpodcast.podbean.com/" target="_blank" rel="noopener noreferrer" className="badge">Podbean</a>
                  <a href="https://music.amazon.com/podcasts" target="_blank" rel="noopener noreferrer" className="badge">Amazon Music</a>
                </div>
              </div>
              <a href="/podcast" className="btn-large btn-primary">View All Episodes</a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section id="social" className="instagram-feed-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Follow Our Journey</h2>
            <p>Stay connected with the latest brewery visits, event highlights, and craft beer community moments</p>

            <div className="social-buttons-grid">
              <a
                href="https://www.instagram.com/brewedat/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-platform-button instagram"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                </svg>
                <span className="platform-name">Instagram</span>
                <span className="platform-handle">@brewedat</span>
              </a>

              <a
                href="https://www.facebook.com/brewedat"
                target="_blank"
                rel="noopener noreferrer"
                className="social-platform-button facebook"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.38823 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9165 4.6875 14.6576 4.6875C15.9705 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.3399 7.875 13.875 8.80001 13.875 9.74899V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"/>
                </svg>
                <span className="platform-name">Facebook</span>
                <span className="platform-handle">BrewedAt</span>
              </a>

              <a
                href="https://www.tiktok.com/@brewedat"
                target="_blank"
                rel="noopener noreferrer"
                className="social-platform-button tiktok"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="platform-name">TikTok</span>
                <span className="platform-handle">@brewedat</span>
              </a>
            </div>
          </div>

          <div className="instagram-embed-container">
            <script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
            <div className="elfsight-app-d8c826a7-8aa0-4d9b-9e2f-7a8e6c5d4b3a" data-elfsight-app-lazy></div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section id="signup" className="email-signup">
        <div className="container">
          <div className="signup-content">
            <h2>Stay Connected</h2>
            <p>Get updates about upcoming events, partnership opportunities, and the latest from the craft beer community.</p>
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
  );
}
