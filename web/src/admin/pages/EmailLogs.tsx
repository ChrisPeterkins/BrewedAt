import { useState, useEffect } from 'react';
import { apiClient, EmailLog } from '@shared/api-client';
import { useToast } from '../context/ToastContext';

export default function EmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const toast = useToast();

  useEffect(() => {
    loadLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getEmailLogs({ limit: 100 });
      if (response.success && response.data) {
        setLogs(response.data.logs);
        setTotal(response.data.total);
      } else {
        toast.error('Failed to load email logs', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error loading email logs:', error);
      toast.error('Failed to load email logs', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return styles.statusSent;
      case 'failed':
        return styles.statusFailed;
      case 'sending':
        return styles.statusSending;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Email Logs</h1>
          <p style={styles.subtitle}>Monitor outgoing emails and delivery status</p>
        </div>
        <button
          style={styles.refreshButton}
          onClick={loadLogs}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{total}</div>
          <div style={styles.statLabel}>Total Emails</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{logs.filter(l => l.status === 'sent').length}</div>
          <div style={styles.statLabel}>Sent</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{logs.filter(l => l.status === 'failed').length}</div>
          <div style={styles.statLabel}>Failed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{logs.filter(l => l.status === 'sending').length}</div>
          <div style={styles.statLabel}>Sending</div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Recipient</th>
              <th style={styles.tableHeader}>Subject</th>
              <th style={styles.tableHeader}>From</th>
              <th style={styles.tableHeader}>Sent At</th>
              <th style={styles.tableHeader}>Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.statusBadge, ...getStatusColor(log.status) }}>
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td style={styles.tableCell}>{log.recipient}</td>
                <td style={styles.tableCell}>{log.subject}</td>
                <td style={styles.tableCell}>{log.from_email}</td>
                <td style={styles.tableCell}>{formatDate(log.sent_at)}</td>
                <td style={styles.tableCell}>
                  {log.error_message ? (
                    <span style={styles.errorText} title={log.error_message}>
                      {log.error_message.substring(0, 50)}
                      {log.error_message.length > 50 && '...'}
                    </span>
                  ) : (
                    <span style={styles.noError}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <p>No emails sent yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#654321',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  refreshButton: {
    backgroundColor: '#8B4513',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#654321',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeaderRow: {
    backgroundColor: '#FAFAF8',
    borderBottom: '1px solid #E0E0E0',
  },
  tableHeader: {
    padding: '16px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #F0F0F0',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#333',
  },
  statusBadge: {
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  statusSent: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusFailed: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  statusSending: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  statusDefault: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  errorText: {
    color: '#C62828',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  noError: {
    color: '#999',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center' as const,
    color: '#999',
  },
};
