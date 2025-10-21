import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@shared/firebase.config';
import type { Event } from '@shared/types';
import { trackEventView } from '../utils/analytics';

export default function EventsPage() {
  const [brewedAtEvents, setBrewedAtEvents] = useState<Event[]>([]);
  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(
        eventsRef,
        where('approved', '==', true),
        orderBy('eventDate', 'asc')
      );
      const snapshot = await getDocs(eventsQuery);

      const brewedat: Event[] = [];
      const local: Event[] = [];

      snapshot.forEach((doc) => {
        const event = { id: doc.id, ...doc.data() } as Event;
        if (event.eventType === 'brewedat') {
          brewedat.push(event);
        } else {
          local.push(event);
        }
      });

      setBrewedAtEvents(brewedat);
      setLocalEvents(local);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (event: Event) => {
    // Track event view for analytics
    await trackEventView(event.id, event.name);
  };

  const EventCard = ({ event }: { event: Event }) => (
    <div
      style={styles.eventCard}
      onClick={() => handleEventClick(event)}
    >
      {event.imageUrl && (
        <div style={styles.eventImage}>
          <img src={event.imageUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={styles.eventContent}>
        <div style={styles.eventHeader}>
          <div style={styles.eventDate}>
            <span style={styles.month}>
              {event.eventDate.toDate().toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span style={styles.day}>
              {event.eventDate.toDate().getDate()}
            </span>
          </div>
          {event.featured && (
            <span style={styles.featuredBadge}>⭐ Featured</span>
          )}
        </div>
        <h3 style={styles.eventName}>{event.name}</h3>
        <p style={styles.eventDescription}>{event.description}</p>
        <div style={styles.eventMeta}>
          <div style={styles.metaItem}>
            <span>📍 {event.location}</span>
          </div>
          {event.eventTime && (
            <div style={styles.metaItem}>
              <span>🕐 {event.eventTime}</span>
            </div>
          )}
        </div>
        {(event.websiteUrl || event.ticketUrl) && (
          <div style={styles.eventActions}>
            {event.websiteUrl && (
              <a
                href={event.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.linkButton}
                onClick={(e) => e.stopPropagation()}
              >
                Learn More
              </a>
            )}
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.primaryLinkButton}
                onClick={(e) => e.stopPropagation()}
              >
                Get Tickets
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <section style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Upcoming Events</h1>
          <p style={styles.pageSubtitle}>
            Discover the best craft beer events, festivals, and taproom happenings in PA & NJ
          </p>
        </div>
      </section>

      {/* BrewedAt Events */}
      {brewedAtEvents.length > 0 && (
        <section style={styles.section}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>BrewedAt Events</h2>
            <div style={styles.eventsGrid}>
              {brewedAtEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Local Events */}
      {localEvents.length > 0 && (
        <section style={styles.section}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Local Craft & Bar Events</h2>
            <div style={styles.eventsGrid}>
              {localEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Events */}
      {brewedAtEvents.length === 0 && localEvents.length === 0 && (
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.noEvents}>
              <h2>No events scheduled at the moment</h2>
              <p>Check back soon for upcoming events!</p>
            </div>
          </div>
        </section>
      )}

      {/* Submit Event CTA */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Have an Event?</h2>
          <p style={styles.ctaText}>
            Hosting an event at a craft beverage location or local bar? Have it featured on BrewedAt!
          </p>
          <a href="/submit-event" style={styles.ctaButton}>
            Submit Your Event
          </a>
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
  header: {
    backgroundColor: '#FFF3E0',
    padding: '60px 0',
    textAlign: 'center' as const,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  pageTitle: {
    fontSize: '42px',
    fontWeight: '700' as const,
    color: '#654321',
    marginBottom: '16px',
  },
  pageSubtitle: {
    fontSize: '18px',
    color: '#8B4513',
  },
  section: {
    padding: '60px 0',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700' as const,
    color: '#654321',
    marginBottom: '32px',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  eventImage: {
    width: '100%',
    height: '200px',
    backgroundColor: '#F5F5F5',
  },
  eventContent: {
    padding: '24px',
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  eventDate: {
    backgroundColor: '#FFF3E0',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '70px',
  },
  month: {
    fontSize: '12px',
    color: '#8B4513',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
  day: {
    fontSize: '24px',
    color: '#D4922A',
    fontWeight: '700' as const,
    marginTop: '4px',
  },
  featuredBadge: {
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  eventName: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#654321',
    marginBottom: '12px',
  },
  eventDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.6',
  },
  eventMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginBottom: '16px',
  },
  metaItem: {
    fontSize: '14px',
    color: '#8B4513',
  },
  eventActions: {
    display: 'flex',
    gap: '12px',
  },
  linkButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#654321',
    border: '1px solid #654321',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s',
  },
  primaryLinkButton: {
    padding: '10px 20px',
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
  noEvents: {
    textAlign: 'center' as const,
    padding: '60px 24px',
    color: '#8B4513',
  },
  cta: {
    backgroundColor: '#654321',
    padding: '60px 0',
    textAlign: 'center' as const,
  },
  ctaTitle: {
    fontSize: '32px',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: '16px',
  },
  ctaText: {
    fontSize: '16px',
    color: '#D4922A',
    marginBottom: '24px',
  },
  ctaButton: {
    padding: '14px 32px',
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
};
