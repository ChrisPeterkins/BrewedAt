import { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client';

export default function Raffles() {
  const [raffles, setRaffles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRaffleId, setExpandedRaffleId] = useState(null);
  const [raffleEntrants, setRaffleEntrants] = useState({});
  const [showManualEntryForm, setShowManualEntryForm] = useState(null);
  const [manualEntryData, setManualEntryData] = useState({ userId: '', entries: 1 });
  const [formData, setFormData] = useState({
    prizeName: '',
    description: '',
    costPerEntry: 100,
    maxEntriesPerUser: 10,
    endDate: '',
  });

  useEffect(() => {
    fetchRaffles();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRaffles = async () => {
    try {
      const response = await apiClient.getRaffles();
      if (response.success && response.data) {
        setRaffles(response.data);
      } else {
        alert('Failed to load raffles: ' + response.error);
      }
    } catch (error) {
      console.error('Error fetching raffles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.createRaffle({
        prizeName: formData.prizeName,
        description: formData.description,
        costPerEntry: parseInt(formData.costPerEntry),
        maxEntriesPerUser: parseInt(formData.maxEntriesPerUser),
        endDate: new Date(formData.endDate).toISOString(),
        status: 'active',
        totalEntries: 0,
      });

      if (response.success) {
        setFormData({
          prizeName: '',
          description: '',
          costPerEntry: 100,
          maxEntriesPerUser: 10,
          endDate: '',
        });
        setShowForm(false);
        fetchRaffles();
        alert('Raffle created successfully!');
      } else {
        alert('Error creating raffle: ' + response.error);
      }
    } catch (error) {
      console.error('Error creating raffle:', error);
      alert('Error creating raffle');
    }
  };

  const handleDrawWinner = async (raffleId) => {
    if (!confirm('Are you sure you want to draw a winner? This cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.drawRaffleWinner(raffleId);

      if (response.success && response.data) {
        fetchRaffles();
        alert(`Winner selected! User ID: ${response.data.winnerId}\nTotal entries: ${response.data.totalEntries}`);
      } else {
        alert('Error drawing winner: ' + response.error);
      }
    } catch (error) {
      console.error('Error drawing winner:', error);
      alert('Error drawing winner');
    }
  };

  const handleEndRaffle = async (raffleId) => {
    if (!confirm('End this raffle without drawing a winner?')) {
      return;
    }

    try {
      const response = await apiClient.updateRaffle(raffleId, { status: 'cancelled' });
      if (response.success) {
        fetchRaffles();
        alert('Raffle cancelled');
      } else {
        alert('Error ending raffle: ' + response.error);
      }
    } catch (error) {
      console.error('Error ending raffle:', error);
      alert('Error ending raffle');
    }
  };

  const fetchRaffleEntrants = async (raffleId) => {
    try {
      console.log('Fetching entrants for raffle:', raffleId);
      const response = await apiClient.getRaffleEntries(raffleId);

      if (response.success && response.data) {
        console.log('Found entries:', response.data.length);
        setRaffleEntrants(prev => ({ ...prev, [raffleId]: response.data }));
      } else {
        alert('Error fetching entrants: ' + response.error);
      }
    } catch (error) {
      console.error('Error fetching entrants:', error);
      console.error('Error details:', error.message);
      alert('Error fetching entrants: ' + error.message);
    }
  };

  const toggleRaffleExpand = (raffleId) => {
    if (expandedRaffleId === raffleId) {
      setExpandedRaffleId(null);
    } else {
      setExpandedRaffleId(raffleId);
      if (!raffleEntrants[raffleId]) {
        fetchRaffleEntrants(raffleId);
      }
    }
  };

  const handleManualEntry = async (raffleId) => {
    if (!manualEntryData.userId.trim()) {
      alert('Please enter a user ID');
      return;
    }

    try {
      const entriesCount = parseInt(manualEntryData.entries);

      const response = await apiClient.enterRaffle(raffleId, {
        userId: manualEntryData.userId,
        entriesCount: entriesCount
      });

      if (response.success) {
        setShowManualEntryForm(null);
        setManualEntryData({ userId: '', entries: 1 });
        fetchRaffleEntrants(raffleId);
        fetchRaffles();
        alert('Entry added successfully!');
      } else {
        alert('Error adding entry: ' + response.error);
      }
    } catch (error) {
      console.error('Error adding manual entry:', error);
      alert('Error adding entry');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const isRaffleExpired = (raffle) => {
    if (!raffle.endDate) return false;
    return new Date(raffle.endDate) < currentTime;
  };

  const getFilteredRaffles = () => {
    if (filterStatus === 'all') return raffles;
    if (filterStatus === 'active') {
      return raffles.filter(r => r.status === 'active' && !isRaffleExpired(r));
    }
    if (filterStatus === 'expired') {
      return raffles.filter(r => r.status === 'active' && isRaffleExpired(r));
    }
    return raffles.filter(r => r.status === filterStatus);
  };

  const filteredRaffles = getFilteredRaffles();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h1 style={{ margin: 0, color: '#654321' }}>Raffle Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#FFF9E6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#654321'
          }}>
            System Time: {currentTime.toLocaleString()}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#D4922A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {showForm ? 'Cancel' : '+ Create Raffle'}
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #E0E0E0',
        paddingBottom: '8px'
      }}>
        {['all', 'active', 'expired', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === status ? '#D4922A' : 'transparent',
              color: filterStatus === status ? 'white' : '#8B4513',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}
          >
            {status} ({status === 'all' ? raffles.length :
              status === 'active' ? raffles.filter(r => r.status === 'active' && !isRaffleExpired(r)).length :
              status === 'expired' ? raffles.filter(r => r.status === 'active' && isRaffleExpired(r)).length :
              raffles.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#654321' }}>Create New Raffle</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#654321' }}>
                Prize Name *
              </label>
              <input
                type="text"
                value={formData.prizeName}
                onChange={(e) => setFormData({ ...formData, prizeName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="e.g., $50 Gift Card to Victory Brewing"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#654321' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
                placeholder="Describe the prize..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#654321' }}>
                  Cost Per Entry (points) *
                </label>
                <input
                  type="number"
                  value={formData.costPerEntry}
                  onChange={(e) => setFormData({ ...formData, costPerEntry: e.target.value })}
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#654321' }}>
                  Max Entries Per User *
                </label>
                <input
                  type="number"
                  value={formData.maxEntriesPerUser}
                  onChange={(e) => setFormData({ ...formData, maxEntriesPerUser: e.target.value })}
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#654321' }}>
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 32px',
                backgroundColor: '#D4922A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Create Raffle
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredRaffles.map(raffle => {
          const isExpired = isRaffleExpired(raffle);
          return (
            <div
              key={raffle.id}
              style={{
                backgroundColor: isExpired ? '#FFEBEE' : 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: isExpired ? 0.8 : 1
              }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: '#654321' }}>{raffle.prizeName}</h3>
                  {isExpired && raffle.status === 'active' && (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: '#FFC107',
                      color: '#000'
                    }}>
                      EXPIRED
                    </span>
                  )}
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: raffle.status === 'active' && !isExpired ? '#E8F5E9' : raffle.status === 'completed' ? '#FFF9E6' : '#FFEBEE',
                    color: raffle.status === 'active' && !isExpired ? '#2E7D32' : raffle.status === 'completed' ? '#D4922A' : '#C62828'
                  }}>
                    {raffle.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#8B4513', margin: '8px 0' }}>{raffle.description}</p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#FAFAF8',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8B4513', marginBottom: '4px' }}>Cost Per Entry</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#654321' }}>{raffle.costPerEntry} pts</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8B4513', marginBottom: '4px' }}>Max Entries/User</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#654321' }}>{raffle.maxEntriesPerUser}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8B4513', marginBottom: '4px' }}>Total Entries</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#654321' }}>{raffle.totalEntries || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8B4513', marginBottom: '4px' }}>End Date</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#654321' }}>{formatDate(raffle.endDate)}</div>
                  </div>
                </div>

                {raffle.winnerId && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#FFF9E6',
                    borderRadius: '8px',
                    borderLeft: '4px solid #D4922A'
                  }}>
                    <strong style={{ color: '#654321' }}>Winner:</strong> {raffle.winnerId}
                    <br />
                    <span style={{ fontSize: '14px', color: '#8B4513' }}>
                      Drawn: {formatDate(raffle.winnerDrawnAt)}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexDirection: 'column' }}>
                <button
                  onClick={() => toggleRaffleExpand(raffle.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#8B4513',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {expandedRaffleId === raffle.id ? 'Hide' : 'View'} Entrants
                </button>
                {raffle.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleDrawWinner(raffle.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Draw Winner
                    </button>
                    <button
                      onClick={() => handleEndRaffle(raffle.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#D32F2F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {expandedRaffleId === raffle.id && (
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '2px solid #E0E0E0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#654321' }}>
                    Entrants ({raffleEntrants[raffle.id]?.length || 0} users, {raffleEntrants[raffle.id]?.reduce((sum, e) => sum + e.entries, 0) || 0} total entries)
                  </h4>
                  <button
                    onClick={() => setShowManualEntryForm(raffle.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#D4922A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    + Add Manual Entry
                  </button>
                </div>

                {showManualEntryForm === raffle.id && (
                  <div style={{
                    backgroundColor: '#FFF9E6',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <h5 style={{ marginTop: 0, color: '#654321' }}>Add Manual Entry</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#654321' }}>
                          User ID
                        </label>
                        <input
                          type="text"
                          value={manualEntryData.userId}
                          onChange={(e) => setManualEntryData({ ...manualEntryData, userId: e.target.value })}
                          placeholder="Enter user ID"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#654321' }}>
                          Entries
                        </label>
                        <input
                          type="number"
                          value={manualEntryData.entries}
                          onChange={(e) => setManualEntryData({ ...manualEntryData, entries: e.target.value })}
                          min="1"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleManualEntry(raffle.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowManualEntryForm(null);
                            setManualEntryData({ userId: '', entries: 1 });
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#999',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {raffleEntrants[raffle.id]?.length > 0 ? (
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#FAFAF8', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #E0E0E0', color: '#654321' }}>User</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #E0E0E0', color: '#654321' }}>User ID</th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #E0E0E0', color: '#654321' }}>Entries</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #E0E0E0', color: '#654321' }}>First Entry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raffleEntrants[raffle.id]
                          .sort((a, b) => b.entries - a.entries)
                          .map((entrant, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F0F0F0' }}>
                            <td style={{ padding: '12px', color: '#654321', fontWeight: '600' }}>{entrant.displayName}</td>
                            <td style={{ padding: '12px', color: '#8B4513', fontSize: '12px', fontFamily: 'monospace' }}>{entrant.userId}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#D4922A', fontWeight: '700' }}>{entrant.entries}</td>
                            <td style={{ padding: '12px', color: '#8B4513', fontSize: '12px' }}>{formatDate(entrant.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px',
                    color: '#8B4513',
                    backgroundColor: '#FAFAF8',
                    borderRadius: '8px'
                  }}>
                    No entrants yet
                  </div>
                )}
              </div>
            )}
            </div>
          );
        })}

        {filteredRaffles.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: '#8B4513',
            backgroundColor: 'white',
            borderRadius: '12px'
          }}>
            <p style={{ fontSize: '18px' }}>
              {raffles.length === 0
                ? 'No raffles yet. Create your first raffle!'
                : `No ${filterStatus} raffles found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}