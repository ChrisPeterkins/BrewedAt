import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@shared/firebase.config';
import type { SocialMediaStats } from '@shared/types';

export default function Footer() {
  const [socialStats, setSocialStats] = useState<SocialMediaStats | null>(null);

  useEffect(() => {
    loadSocialStats();
  }, []);

  const loadSocialStats = async () => {
    try {
      const docRef = doc(db, 'siteConfig', 'socialMedia');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSocialStats(docSnap.data() as SocialMediaStats);
      }
    } catch (error) {
      console.error('Error loading social stats:', error);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.logoSection}>
            <img
              src="/brewedat-logo.png"
              alt="BrewedAt Logo"
              style={styles.logo}
            />
            <p style={styles.tagline}>
              Tap into the local craft beverage scene
            </p>
          </div>

          <div style={styles.links}>
            <div style={styles.linkColumn}>
              <h3 style={styles.columnTitle}>Explore</h3>
              <Link to="/events" style={styles.link}>Events</Link>
              <Link to="/podcast" style={styles.link}>Podcast</Link>
              <Link to="/press" style={styles.link}>Press</Link>
              <Link to="/hall-of-champions" style={styles.link}>Hall of Champions</Link>
            </div>

            <div style={styles.linkColumn}>
              <h3 style={styles.columnTitle}>Get Involved</h3>
              <Link to="/for-business" style={styles.link}>Partner With Us</Link>
              <Link to="/submit-event" style={styles.link}>Submit Event</Link>
            </div>

            <div style={styles.linkColumn}>
              <h3 style={styles.columnTitle}>Connect</h3>
              {socialStats && (
                <>
                  <a
                    href={`https://instagram.com/${socialStats.instagram.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    Instagram
                  </a>
                  <a
                    href={`https://facebook.com/${socialStats.facebook.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/${socialStats.twitter.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    Twitter/X
                  </a>
                  <a
                    href={`https://youtube.com/${socialStats.youtube.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    YouTube
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {currentYear} BrewedAt. All rights reserved. Drink responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#2C1810',
    color: '#FFFFFF',
    padding: '48px 0 24px',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  logo: {
    height: '50px',
    width: 'auto',
  },
  tagline: {
    color: '#D4922A',
    fontSize: '14px',
    margin: 0,
  },
  links: {
    display: 'contents',
  },
  linkColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  columnTitle: {
    color: '#D4922A',
    fontSize: '14px',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 8px 0',
  },
  link: {
    color: '#CCCCCC',
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  bottom: {
    borderTop: '1px solid #3D2A1F',
    paddingTop: '24px',
    textAlign: 'center' as const,
  },
  copyright: {
    color: '#999999',
    fontSize: '13px',
    margin: 0,
  },
};
