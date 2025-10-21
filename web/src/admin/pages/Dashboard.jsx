import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';
import BreweryTable from '../components/BreweryTable';
import Raffles from './Raffles';
import DataManagement from './DataManagement';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('breweries');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
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
            ...(activeTab === 'breweries' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('breweries')}
        >
          Breweries & Events
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'raffles' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('raffles')}
        >
          Raffles
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === 'data' ? styles.navButtonActive : {})
          }}
          onClick={() => setActiveTab('data')}
        >
          Data Management
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === 'breweries' && <BreweryTable />}
        {activeTab === 'raffles' && <Raffles />}
        {activeTab === 'data' && <DataManagement />}
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
    backgroundColor: 'transparent',
    color: '#8B4513',
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
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