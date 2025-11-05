import { useState } from 'react';
import { apiClient } from '@shared/api-client';
// import BreweryTable from '../components/BreweryTable';
import Events from './Events';
import Podcast from './Podcast';
import Content from './Content';
// import Analytics from './Analytics';
import Raffles from './Raffles';
// import DataManagement from './DataManagement';
// import ContactSubmissions from './ContactSubmissions';

type TabType = 'events' | 'podcast' | 'content' | 'analytics' | 'breweries' | 'raffles' | 'data' | 'contact';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('events');

  const handleSignOut = async () => {
    try {
      apiClient.logout();
      onLogout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>BrewedAt Admin Dashboard</h1>
        <button style={styles.signOutButton} onClick={handleSignOut}>
          Sign Out
        </button>
      </header>

      <nav style={styles.nav}>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'events' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('events')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          Events
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'podcast' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('podcast')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
          </svg>
          Podcast
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'content' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('content')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Content
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'analytics' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('analytics')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"/>
            <path d="M18 17V9M13 17V5M8 17v-3"/>
          </svg>
          Analytics
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'breweries' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('breweries')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 11h1a3 3 0 0 1 0 6h-1M17 7h1a3 3 0 0 1 0 6h-1"/>
            <path d="M17 3v18M9 3v18"/>
            <path d="M3 7a3 3 0 0 1 3-3h3v14H6a3 3 0 0 1-3-3V7z"/>
          </svg>
          Breweries
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'contact' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('contact')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Contact
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'raffles' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('raffles')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/>
            <path d="M3 7l9-4 9 4M9 11v.01M15 11v.01M9 15v.01M15 15v.01"/>
          </svg>
          Raffles
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'data' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('data')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
          </svg>
          Settings
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === 'events' && <Events />}
        {activeTab === 'podcast' && <Podcast />}
        {activeTab === 'content' && <Content />}
        {/* {activeTab === 'analytics' && <Analytics />} */}
        {/* {activeTab === 'breweries' && <BreweryTable />} */}
        {/* {activeTab === 'contact' && <ContactSubmissions />} */}
        {activeTab === 'raffles' && <Raffles />}
        {/* {activeTab === 'data' && <DataManagement />} */}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFAF8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: '20px 32px',
    borderBottom: '1px solid #E0E0E0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#654321',
    margin: 0,
  },
  signOutButton: {
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  nav: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E0E0E0',
    display: 'flex',
    gap: '8px',
    padding: '0 32px',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#8B4513',
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  navButtonActive: {
    color: '#D4922A',
    borderBottomColor: '#D4922A',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 16px',
  },
};
