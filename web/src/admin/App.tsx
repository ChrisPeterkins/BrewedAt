import { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token on mount
    const verifyAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        const response = await apiClient.verifyToken();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token invalid or expired
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const handleLoginSuccess = async () => {
    // Re-verify to get user data
    const response = await apiClient.verifyToken();
    if (response.success && response.data) {
      setUser(response.data);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#8B4513',
  },
};

export default App;
