import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';
import BreweryTable from '../components/BreweryTable';

export default function Dashboard() {
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

      <main style={styles.main}>
        <BreweryTable />
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
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 16px',
  },
};