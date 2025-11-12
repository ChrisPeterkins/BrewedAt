import { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client';
import { useToast } from '../context/ToastContext';

interface ConfigItem {
  key: string;
  value: string;
  updatedAt: string;
}

export default function Settings() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const toast = useToast();

  // Common site configuration keys
  const commonKeys = [
    { key: 'site_name', label: 'Site Name', placeholder: 'BrewedAt' },
    { key: 'site_description', label: 'Site Description', placeholder: 'Your craft beer community' },
    { key: 'contact_email', label: 'Contact Email', placeholder: 'contact@brewedat.com' },
    { key: 'smtp_host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
    { key: 'smtp_port', label: 'SMTP Port', placeholder: '587' },
    { key: 'smtp_user', label: 'SMTP Username', placeholder: 'your-email@gmail.com' },
    { key: 'smtp_password', label: 'SMTP Password', placeholder: 'your-app-password' },
    { key: 'from_email', label: 'From Email', placeholder: 'noreply@brewedat.com' },
    { key: 'from_name', label: 'From Name', placeholder: 'BrewedAt Team' },
  ];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSiteConfig();
      if (response.success && response.data) {
        // Convert object to array
        const configArray = Object.entries(response.data).map(([key, value]) => ({
          key,
          value: value as string,
          updatedAt: new Date().toISOString()
        }));
        setConfigs(configArray);
      } else {
        toast.error('Failed to load settings', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const getConfigValue = (key: string): string => {
    const config = configs.find(c => c.key === key);
    return config?.value || '';
  };

  const handleEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(getConfigValue(key));
  };

  const handleSave = async (key: string) => {
    setLoading(true);
    try {
      const response = await apiClient.setConfigValue(key, editValue);
      if (response.success) {
        toast.success('Setting saved', `${key} has been updated`);
        await loadConfigs();
        setEditingKey(null);
      } else {
        toast.error('Failed to save setting', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error saving setting:', error);
      toast.error('Failed to save setting', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>Configure site and email settings</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Site Configuration</h2>
        <div style={styles.configList}>
          {commonKeys.map((item) => (
            <div key={item.key} style={styles.configItem}>
              <div style={styles.configLabel}>
                <strong>{item.label}</strong>
                <span style={styles.configKey}>{item.key}</span>
              </div>
              {editingKey === item.key ? (
                <div style={styles.editContainer}>
                  <input
                    type={item.key.includes('password') ? 'password' : 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={item.placeholder}
                    style={styles.input}
                    autoFocus
                  />
                  <div style={styles.editActions}>
                    <button
                      onClick={() => handleSave(item.key)}
                      style={styles.saveButton}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      style={styles.cancelButton}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.viewContainer}>
                  <div style={styles.configValue}>
                    {getConfigValue(item.key) || (
                      <span style={styles.emptyValue}>Not set</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(item.key)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>Email Configuration</h3>
        <p style={styles.infoText}>
          Configure SMTP settings to enable email notifications for new user accounts.
          For Gmail, use an App Password instead of your regular password.
        </p>
        <p style={styles.infoText}>
          <strong>Gmail Setup:</strong> Enable 2FA, then create an App Password at{' '}
          <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={styles.link}>
            myaccount.google.com/apppasswords
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
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
  section: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#654321',
    marginBottom: '24px',
  },
  configList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  configItem: {
    padding: '16px',
    backgroundColor: '#FAFAF8',
    borderRadius: '8px',
    border: '1px solid #E0E0E0',
  },
  configLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    marginBottom: '8px',
  },
  configKey: {
    fontSize: '12px',
    color: '#999',
    fontFamily: 'monospace',
  },
  configValue: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    color: '#333',
    backgroundColor: '#FFF',
    borderRadius: '6px',
    border: '1px solid #E0E0E0',
    fontFamily: 'monospace',
  },
  emptyValue: {
    color: '#999',
    fontStyle: 'italic' as const,
  },
  viewContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  editContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'monospace',
  },
  editActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    backgroundColor: '#8B4513',
    color: '#FFFFFF',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    color: '#666',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  infoBox: {
    backgroundColor: '#FFF8F0',
    border: '1px solid #FFE0B2',
    borderRadius: '12px',
    padding: '20px',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#654321',
    marginBottom: '12px',
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    lineHeight: '1.6',
  },
  link: {
    color: '#8B4513',
    textDecoration: 'underline',
  },
};
