import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@shared/firebase.config';
import type { PodcastEpisode } from '@shared/types';

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      const episodesRef = collection(db, 'podcastEpisodes');
      const q = query(episodesRef, orderBy('publishDate', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PodcastEpisode[];
      setEpisodes(data);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div>
      <section style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>The BrewedAt Podcast</h1>
          <p style={styles.subtitle}>
            Conversations with local beer and community innovators
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          {episodes.length === 0 ? (
            <div style={styles.noEpisodes}>
              <h2>No episodes yet</h2>
              <p>Check back soon for our latest conversations!</p>
            </div>
          ) : (
            <div style={styles.episodesGrid}>
              {episodes.map((episode) => (
                <div key={episode.id} style={styles.episodeCard}>
                  {episode.thumbnailUrl && (
                    <div style={styles.thumbnail}>
                      <img src={episode.thumbnailUrl} alt={episode.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                  )}
                  <div style={styles.episodeContent}>
                    <div style={styles.episodeHeader}>
                      <span style={styles.episodeNumber}>Episode {episode.episodeNumber}</span>
                      {episode.featured && <span style={styles.featured}>Featured</span>}
                    </div>
                    <h3 style={styles.episodeTitle}>{episode.title}</h3>
                    {episode.guestName && (
                      <p style={styles.guest}>with {episode.guestName}</p>
                    )}
                    <p style={styles.description}>{episode.description}</p>
                    <div style={styles.episodeMeta}>
                      <span>{episode.publishDate.toDate().toLocaleDateString()}</span>
                      {episode.duration && <span>• {episode.duration}</span>}
                    </div>
                    <div style={styles.links}>
                      {episode.spotifyUrl && (
                        <a href={episode.spotifyUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                          Spotify
                        </a>
                      )}
                      {episode.appleUrl && (
                        <a href={episode.appleUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                          Apple
                        </a>
                      )}
                      {episode.youtubeUrl && (
                        <a href={episode.youtubeUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '18px', color: '#8B4513' },
  header: { backgroundColor: '#FFF3E0', padding: '60px 0', textAlign: 'center' as const },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  title: { fontSize: '42px', fontWeight: '700' as const, color: '#654321', marginBottom: '16px' },
  subtitle: { fontSize: '18px', color: '#8B4513' },
  section: { padding: '60px 0' },
  episodesGrid: { display: 'grid', gap: '24px' },
  episodeCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', gap: '24px', padding: '24px' },
  thumbnail: { width: '200px', height: '200px', flexShrink: 0, backgroundColor: '#F5F5F5', borderRadius: '8px', overflow: 'hidden' },
  episodeContent: { flex: 1 },
  episodeHeader: { display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' },
  episodeNumber: { fontSize: '12px', color: '#8B4513', fontWeight: '600' as const, textTransform: 'uppercase' as const },
  featured: { backgroundColor: '#D4922A', color: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' as const },
  episodeTitle: { fontSize: '24px', fontWeight: '600' as const, color: '#654321', marginBottom: '8px' },
  guest: { fontSize: '14px', color: '#D4922A', marginBottom: '12px', fontStyle: 'italic' as const },
  description: { fontSize: '15px', color: '#666', marginBottom: '16px', lineHeight: '1.6' },
  episodeMeta: { fontSize: '13px', color: '#999', marginBottom: '16px' },
  links: { display: 'flex', gap: '12px' },
  link: { padding: '8px 16px', backgroundColor: '#D4922A', color: '#FFFFFF', borderRadius: '6px', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none' },
  noEpisodes: { textAlign: 'center' as const, padding: '60px 24px', color: '#8B4513' },
};
