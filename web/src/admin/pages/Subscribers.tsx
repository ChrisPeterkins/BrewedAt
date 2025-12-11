import { useState, useEffect } from 'react';
import { apiClient, EmailSubscriber } from '@shared/api-client';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [sortField, setSortField] = useState<'subscribedAt' | 'email'>('subscribedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSubscribers();
      if (response.success && response.data) {
        setSubscribers(response.data);
        // Get active count from meta if available
        const meta = (response as any).meta;
        if (meta) {
          setTotalCount(meta.activeCount || response.data.length);
        } else {
          setTotalCount(response.data.filter(s => !s.unsubscribedAt).length);
        }
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber? This cannot be undone.')) return;

    try {
      const response = await apiClient.deleteSubscriber(id);
      if (response.success) {
        loadSubscribers();
      } else {
        alert(response.error || 'Failed to delete subscriber');
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Failed to delete subscriber');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const activeSubscribers = subscribers.filter(s => !s.unsubscribedAt);
    const csv = [
      ['Email', 'Source', 'Subscribed At'].join(','),
      ...activeSubscribers.map(s => [
        s.email,
        s.source,
        s.subscribedAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brewedat-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and sort subscribers
  const filteredAndSortedSubscribers = subscribers
    .filter(subscriber => {
      const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !subscriber.unsubscribedAt) ||
        (statusFilter === 'unsubscribed' && subscriber.unsubscribedAt);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === 'subscribedAt') {
        comparison = new Date(a.subscribedAt).getTime() - new Date(b.subscribedAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'subscribedAt' | 'email') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const activeCount = subscribers.filter(s => !s.unsubscribedAt).length;
  const unsubscribedCount = subscribers.filter(s => s.unsubscribedAt).length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#654321' }}>
            Email Subscribers
          </h1>
          <p style={{ margin: 0, color: '#8B4513', fontSize: '14px' }}>
            Manage newsletter subscribers from the Stay Connected section
          </p>
        </div>
        <button
          onClick={exportToCSV}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#4CAF50' }}>{activeCount}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Active Subscribers</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f44336' }}>{unsubscribedCount}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Unsubscribed</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#654321' }}>{subscribers.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total All Time</div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
          All Subscribers
        </h2>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'unsubscribed')}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="unsubscribed">Unsubscribed Only</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            Loading subscribers...
          </p>
        ) : subscribers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No subscribers yet.
          </p>
        ) : filteredAndSortedSubscribers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No subscribers match your filters.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321', width: '80px' }}>Status</th>
                  <th
                    onClick={() => handleSort('email')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#654321',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Source</th>
                  <th
                    onClick={() => handleSort('subscribedAt')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#654321',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Subscribed {sortField === 'subscribedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: subscriber.unsubscribedAt ? '#fafafa' : 'white',
                      opacity: subscriber.unsubscribedAt ? 0.7 : 1,
                    }}
                  >
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: subscriber.unsubscribedAt ? '#FFEBEE' : '#E8F5E9',
                          color: subscriber.unsubscribedAt ? '#C62828' : '#2E7D32',
                        }}
                      >
                        {subscriber.unsubscribedAt ? 'Unsubscribed' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '500', color: '#333' }}>{subscriber.email}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                      {subscriber.source || 'website'}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                      {formatDate(subscriber.subscribedAt)}
                      {subscriber.unsubscribedAt && (
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                          Unsub: {formatDate(subscriber.unsubscribedAt)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
