import { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client';
import { useToast } from '../context/ToastContext';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'admin',
    sendEmail: true
  });
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({ email: '', password: '' });
  const toast = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        toast.error('Failed to load users', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.warning('Missing fields', 'Email and password are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.warning('Invalid password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.createUser(formData);
      if (response.success) {
        const emailStatus = response.data?.emailSent ? ' (welcome email sent)' : ' (email not sent - check SMTP settings)';
        toast.success('User created', `${formData.email} has been added${emailStatus}`);

        // Show credentials modal
        setCreatedCredentials({ email: formData.email, password: formData.password });
        setShowCredentials(true);

        setFormData({ email: '', password: '', displayName: '', role: 'admin', sendEmail: true });
        setShowForm(false);
        loadUsers();
      } else {
        toast.error('Failed to create user', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.deleteUser(user.id);
      if (response.success) {
        toast.success('User deleted', `${user.email} has been removed`);
        loadUsers();
      } else {
        toast.error('Failed to delete user', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>Manage admin accounts</p>
        </div>
        <button
          style={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Create New Admin User</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password * (min 6 characters)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
                minLength={6}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={styles.input}
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                Send welcome email with credentials
              </label>
            </div>
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Display Name</th>
              <th style={styles.tableHeader}>Role</th>
              <th style={styles.tableHeader}>Created</th>
              <th style={styles.tableHeader}>Last Login</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{user.email}</td>
                <td style={styles.tableCell}>{user.displayName || '-'}</td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.badge,
                    ...(user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser)
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.tableCell}>{formatDate(user.createdAt)}</td>
                <td style={styles.tableCell}>{formatDate(user.lastLoginAt)}</td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => handleDelete(user)}
                    style={styles.deleteButton}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Credentials Modal */}
      {showCredentials && (
        <div style={styles.modalOverlay} onClick={() => setShowCredentials(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>User Credentials</h2>
              <button style={styles.modalClose} onClick={() => setShowCredentials(false)}>×</button>
            </div>
            <div style={styles.modalContent}>
              <p style={styles.modalText}>
                User account created successfully! {formData.sendEmail && 'A welcome email has been sent with these credentials.'}
              </p>
              <div style={styles.credentialsBox}>
                <div style={styles.credentialRow}>
                  <strong>Email:</strong>
                  <code style={styles.credentialValue}>{createdCredentials.email}</code>
                </div>
                <div style={styles.credentialRow}>
                  <strong>Password:</strong>
                  <code style={styles.credentialValue}>{createdCredentials.password}</code>
                </div>
              </div>
              <p style={styles.modalWarning}>
                ⚠️ Make sure to save these credentials. This is the only time the password will be displayed.
              </p>
              <button style={styles.modalButton} onClick={() => setShowCredentials(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1200px',
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
  addButton: {
    backgroundColor: '#8B4513',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#654321',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    color: '#666',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    color: '#FFFFFF',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
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
  badge: {
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
  },
  badgeAdmin: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  badgeUser: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
  deleteButton: {
    backgroundColor: '#FFF',
    color: '#D32F2F',
    padding: '6px 16px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #D32F2F',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center' as const,
    color: '#999',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #E0E0E0',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#654321',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    color: '#999',
    cursor: 'pointer',
    padding: 0,
  },
  modalContent: {
    padding: '24px',
  },
  modalText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  credentialsBox: {
    backgroundColor: '#FFF8F0',
    border: '2px solid #8B4513',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  credentialRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  credentialValue: {
    backgroundColor: '#F5F5F5',
    padding: '8px 12px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '14px',
    flex: 1,
  },
  modalWarning: {
    backgroundColor: '#FFF3E0',
    border: '1px solid #FFE0B2',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '13px',
    color: '#E65100',
    marginBottom: '20px',
  },
  modalButton: {
    backgroundColor: '#8B4513',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
  },
};
