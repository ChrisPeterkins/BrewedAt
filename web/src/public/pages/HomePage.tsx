import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@shared/firebase.config';
import type { HomePageContent, Event, SocialMediaStats } from '@shared/types';

export default function HomePage() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [socialStats, setSocialStats] = useState<SocialMediaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomePageData();
  }, []);

  const loadHomePageData = async () => {
    try {
      // Load homepage content
      const contentDoc = await getDoc(doc(db, 'siteConfig', 'homepage'));
      if (contentDoc.exists()) {
        setContent(contentDoc.data() as HomePageContent);
      }

      // Load social stats
      const socialDoc = await getDoc(doc(db, 'siteConfig', 'socialMedia'));
      if (socialDoc.exists()) {
        setSocialStats(socialDoc.data() as SocialMediaStats);
      }

      // Load upcoming events
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(
        eventsRef,
        where('approved', '==', true),
        orderBy('eventDate', 'asc'),
        limit(3)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalFollowers = () => {
    if (!socialStats) return '15,000+';
    const total = (socialStats.instagram?.followers || 0) +
      (socialStats.facebook?.followers || 0) +
      (socialStats.twitter?.followers || 0) +
      (socialStats.youtube?.subscribers || 0);
    return total > 0 ? `${(total / 1000).toFixed(1)}K+` : '15,000+';
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              {content?.heroTitle || 'Tap into the Local Craft Beverage Scene'}
            </h1>
            <p style={styles.heroSubtitle}>
              {content?.heroSubtitle || "Something's always brewing in the craft beverage scene. Stay up to date on unforgettable events, local stories, and interactive campaigns!"}
            </p>
            <div style={styles.heroCTA}>
              <Link to="/events" style={styles.primaryButton}>
                Explore Events
              </Link>
              <Link to="/for-business" style={styles.secondaryButton}>
                Partner With Us
              </Link>
            </div>
            <div style={styles.stats}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{getTotalFollowers()}</span>
                <span style={styles.statLabel}>Community Members</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={styles.about}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>
            {content?.aboutTitle || 'Connecting the Craft Beer Community'}
          </h2>
          <p style={styles.aboutText}>
            {content?.aboutContent || 'We create unforgettable events, compelling content, and powerful marketing campaigns that bring breweries, bars, and beer lovers together across PA & NJ.'}
          </p>

          <div style={styles.statsGrid}>
            {content && (
              <>
                <div style={styles.statCard}>
                  <div style={styles.statCardNumber}>{content.statsValue1}</div>
                  <div style={styles.statCardLabel}>{content.statsLabel1}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statCardNumber}>{content.statsValue2}</div>
                  <div style={styles.statCardLabel}>{content.statsLabel2}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statCardNumber}>{content.statsValue3}</div>
                  <div style={styles.statCardLabel}>{content.statsLabel3}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section style={styles.events}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Upcoming Events</h2>
            <div style={styles.eventsGrid}>
              {upcomingEvents.map((event) => (
                <Link to="/events" key={event.id} style={styles.eventCard}>
                  <div style={styles.eventDate}>
                    <span style={styles.eventMonth}>
                      {event.eventDate.toDate().toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span style={styles.eventDay}>
                      {event.eventDate.toDate().getDate()}
                    </span>
                  </div>
                  <div style={styles.eventDetails}>
                    <h3 style={styles.eventName}>{event.name}</h3>
                    <p style={styles.eventLocation}>{event.location}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/events" style={styles.primaryButton}>
                View All Events
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to Join the Community?</h2>
          <p style={styles.ctaText}>
            Follow us on social media, attend our events, or partner with us to reach the craft beer audience.
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/events" style={styles.primaryButton}>
              Find Events
            </Link>
            <Link to="/for-business" style={styles.secondaryButton}>
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    fontSize: '18px',
    color: '#8B4513',
  },
  hero: {
    backgroundColor: '#FFF3E0',
    padding: '80px 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800' as const,
    color: '#654321',
    marginBottom: '24px',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '20px',
    color: '#8B4513',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  heroCTA: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '48px',
  },
  primaryButton: {
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#654321',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    border: '2px solid #654321',
    transition: 'all 0.2s',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '700' as const,
    color: '#D4922A',
  },
  statLabel: {
    fontSize: '14px',
    color: '#8B4513',
    marginTop: '8px',
  },
  about: {
    padding: '80px 0',
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700' as const,
    color: '#654321',
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  aboutText: {
    fontSize: '18px',
    color: '#666',
    textAlign: 'center' as const,
    maxWidth: '700px',
    margin: '0 auto 48px',
    lineHeight: '1.7',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  statCard: {
    backgroundColor: '#FFF3E0',
    padding: '32px 24px',
    borderRadius: '12px',
    textAlign: 'center' as const,
  },
  statCardNumber: {
    fontSize: '32px',
    fontWeight: '700' as const,
    color: '#D4922A',
    marginBottom: '8px',
  },
  statCardLabel: {
    fontSize: '14px',
    color: '#8B4513',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  events: {
    padding: '80px 0',
    backgroundColor: '#FAFAF8',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '40px',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    gap: '16px',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  eventDate: {
    backgroundColor: '#FFF3E0',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '70px',
  },
  eventMonth: {
    fontSize: '12px',
    color: '#8B4513',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
  eventDay: {
    fontSize: '28px',
    color: '#D4922A',
    fontWeight: '700' as const,
    marginTop: '4px',
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#654321',
    marginBottom: '8px',
  },
  eventLocation: {
    fontSize: '14px',
    color: '#666',
  },
  cta: {
    backgroundColor: '#654321',
    padding: '80px 0',
    textAlign: 'center' as const,
  },
  ctaTitle: {
    fontSize: '36px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: '16px',
  },
  ctaText: {
    fontSize: '18px',
    color: '#D4922A',
    marginBottom: '32px',
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
};
