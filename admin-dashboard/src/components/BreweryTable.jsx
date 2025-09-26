import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import QRCodeModal from './QRCodeModal';

export default function BreweryTable() {
  const [breweries, setBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrewery, setSelectedBrewery] = useState(null);

  useEffect(() => {
    loadBreweries();
  }, []);

  const loadBreweries = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const breweriesData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBreweries(breweriesData);
    } catch (error) {
      console.error('Error loading breweries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading breweries...</div>;
  }

  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.title}>Breweries ({breweries.length})</h2>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Points</th>
                <th style={styles.th}>Styles</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {breweries.map((brewery) => (
                <tr key={brewery.id} style={styles.row}>
                  <td style={styles.td}>{brewery.name}</td>
                  <td style={styles.td}>{brewery.address}</td>
                  <td style={styles.td}>{brewery.pointsReward}</td>
                  <td style={styles.td}>
                    {brewery.styles?.join(', ') || 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.qrButton}
                      onClick={() => setSelectedBrewery(brewery)}
                    >
                      Generate QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBrewery && (
        <QRCodeModal
          brewery={selectedBrewery}
          onClose={() => setSelectedBrewery(null)}
        />
      )}
    </>
  );
}

const styles = {
  container: {
    padding: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    fontSize: '18px',
    color: '#8B4513',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#654321',
    marginBottom: '24px',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    backgroundColor: '#F5F5F5',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#654321',
    borderBottom: '2px solid #E0E0E0',
  },
  row: {
    borderBottom: '1px solid #E0E0E0',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#333',
  },
  qrButton: {
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};