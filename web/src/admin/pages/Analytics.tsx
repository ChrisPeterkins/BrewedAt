import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { EventView, EventAnalytics } from '@shared/types';

interface Stats {
  totalEventViews: number;
  totalEvents: number;
  totalPodcastEpisodes: number;
  popularEvents: EventAnalytics[];
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats>({
    totalEventViews: 0,
    totalEvents: 0,
    totalPodcastEpisodes: 0,
    popularEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get total events count
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const totalEvents = eventsSnapshot.size;

      // Get total podcast episodes count
      const podcastSnapshot = await getDocs(collection(db, 'podcastEpisodes'));
      const totalPodcastEpisodes = podcastSnapshot.size;

      // Get event views
      const viewsRef = collection(db, 'eventViews');
      let viewsQuery = query(viewsRef);

      // Apply time range filter
      if (timeRange !== 'all') {
        const daysAgo = timeRange === '7d' ? 7 : 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        // Note: This would need a timestamp field in the query
      }

      const viewsSnapshot = await getDocs(viewsQuery);
      const totalEventViews = viewsSnapshot.size;

      // Calculate popular events
      const eventViewsMap = new Map<string, { name: string; count: number }>();

      viewsSnapshot.forEach((doc) => {
        const view = doc.data() as EventView;
        const existing = eventViewsMap.get(view.eventId);
        if (existing) {
          existing.count++;
        } else {
          eventViewsMap.set(view.eventId, {
            name: view.eventName,
            count: 1,
          });
        }
      });

      // Convert to array and sort
      const popularEvents: EventAnalytics[] = Array.from(eventViewsMap.entries())
        .map(([eventId, data]) => ({
          eventId,
          eventName: data.name,
          totalViews: data.count,
          uniqueViews: data.count, // For now, same as total
        }))
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 10);

      setStats({
        totalEventViews,
        totalEvents,
        totalPodcastEpisodes,
        popularEvents,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#8B4513' }}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#654321' }}>Analytics Dashboard</h1>
          <p style={{ margin: 0, color: '#8B4513', fontSize: '14px' }}>
            Track event views and website engagement
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTimeRange('7d')}
            style={{
              padding: '8px 16px',
              backgroundColor: timeRange === '7d' ? '#D4922A' : '#f5f5f5',
              color: timeRange === '7d' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            style={{
              padding: '8px 16px',
              backgroundColor: timeRange === '30d' ? '#D4922A' : '#f5f5f5',
              color: timeRange === '30d' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: timeRange === 'all' ? '#D4922A' : '#f5f5f5',
              color: timeRange === 'all' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '14px', color: '#8B4513', marginBottom: '8px', fontWeight: '600' }}>
            Total Event Views
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#654321' }}>
            {stats.totalEventViews.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            📊 Event page views
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '14px', color: '#8B4513', marginBottom: '8px', fontWeight: '600' }}>
            Total Events
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#654321' }}>
            {stats.totalEvents}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            📅 Published events
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '14px', color: '#8B4513', marginBottom: '8px', fontWeight: '600' }}>
            Podcast Episodes
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#654321' }}>
            {stats.totalPodcastEpisodes}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            🎙️ Published episodes
          </div>
        </div>
      </div>

      {/* Popular Events */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
          🔥 Most Viewed Events
        </h2>

        {stats.popularEvents.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No event views tracked yet. Views will appear here once users visit event pages.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Rank</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Event Name</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Total Views</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Unique Views</th>
                </tr>
              </thead>
              <tbody>
                {stats.popularEvents.map((event, index) => (
                  <tr key={event.eventId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', color: '#666', fontWeight: '600' }}>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{event.eventName}</div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#666', fontWeight: '600' }}>
                      {event.totalViews}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                      {event.uniqueViews}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: '#FFF3E0',
        borderLeft: '4px solid #D4922A',
        borderRadius: '8px',
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#654321', fontSize: '16px' }}>
          💡 How Event Tracking Works
        </h3>
        <p style={{ margin: 0, color: '#8B4513', fontSize: '14px', lineHeight: '1.6' }}>
          Event views are automatically tracked when visitors view event details on your public website.
          This data helps you understand which events are most popular and engaging with your audience.
        </p>
      </div>
    </div>
  );
}
