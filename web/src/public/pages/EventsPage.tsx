import { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client';
import type { Event } from '@shared/api-client';
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
      const response = await apiClient.getEvents();

      if (response.success && response.data) {
        const brewedat: Event[] = [];
        const local: Event[] = [];

        response.data.forEach((event) => {
          if (event.eventType === 'brewedat') {
            brewedat.push(event);
          } else {
            local.push(event);
          }
        });

        setBrewedAtEvents(brewedat);
        setLocalEvents(local);
      } else {
        console.error('Error loading events:', response.error);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (event: Event) => {
    // Track event view for analytics
    await trackEventView(event.id, event.title);
  };

  const EventCard = ({ event }: { event: Event }) => {
    // Parse date from ISO string
    const eventDate = new Date(event.date);

    return (
      <div
        style={styles.eventCard}
        onClick={() => handleEventClick(event)}
      >
        {event.imageUrl && (
          <div style={styles.eventImage}>
            <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={styles.eventContent}>
          <div style={styles.eventHeader}>
            <div style={styles.eventDate}>
              <span style={styles.month}>
                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span style={styles.day}>
                {eventDate.getDate()}
              </span>
            </div>
            {event.featured === 1 && (
              <span style={styles.featuredBadge}>Featured</span>
            )}
          </div>
          <h3 style={styles.eventName}>{event.title}</h3>
          <p style={styles.eventDescription}>{event.description}</p>
          <div style={styles.eventMeta}>
            <div style={styles.metaItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{event.location}</span>
            </div>
            {event.time && (
              <div style={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span>{event.time}</span>
              </div>
            )}
          </div>
          {event.externalUrl && (
            <div style={styles.eventActions}>
              <a
                href={event.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.primaryLinkButton}
                onClick={(e) => e.stopPropagation()}
              >
                Learn More
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    color: '#25303d',
  },
  header: {
    backgroundColor: '#fef5e7',
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
    color: '#1f3540',
    marginBottom: '16px',
  },
  pageSubtitle: {
    fontSize: '18px',
    color: '#25303d',
  },
  section: {
    padding: '60px 0',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700' as const,
    color: '#1f3540',
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
    backgroundColor: '#fef5e7',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '70px',
  },
  month: {
    fontSize: '12px',
    color: '#25303d',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
  day: {
    fontSize: '24px',
    color: '#fd5526',
    fontWeight: '700' as const,
    marginTop: '4px',
  },
  featuredBadge: {
    backgroundColor: '#fd5526',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  eventName: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#1f3540',
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#25303d',
  },
  eventActions: {
    display: 'flex',
    gap: '12px',
  },
  linkButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#1f3540',
    border: '1px solid #1f3540',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s',
  },
  primaryLinkButton: {
    padding: '10px 20px',
    backgroundColor: '#fd5526',
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
    color: '#25303d',
  },
  cta: {
    backgroundColor: '#1f3540',
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
    color: '#fd5526',
    marginBottom: '24px',
  },
  ctaButton: {
    padding: '14px 32px',
    backgroundColor: '#fd5526',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
};
