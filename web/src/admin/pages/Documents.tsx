import { useState, useEffect } from 'react';
import { apiClient, Document } from '@shared/api-client';
import { useToast } from '../context/ToastContext';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [description, setDescription] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        toast.error('Failed to load documents', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);

    for (const file of files) {
      try {
        const response = await apiClient.uploadDocument(file, description || undefined);
        if (response.success) {
          toast.success('Upload successful', `${file.name} uploaded`);
        } else {
          toast.error('Upload failed', response.error || `Failed to upload ${file.name}`);
        }
      } catch (error: any) {
        toast.error('Upload error', error.message || `Error uploading ${file.name}`);
      }
    }

    setUploading(false);
    setDescription('');
    loadDocuments();
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete ${doc.original_name}?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteDocument(doc.id);
      if (response.success) {
        toast.success('Document deleted', `${doc.original_name} has been removed`);
        loadDocuments();
      } else {
        toast.error('Delete failed', response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Delete error', error.message || 'Network error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return '📊';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('json')) return '🔧';
    if (mimeType.includes('text')) return '📃';
    return '📎';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
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
          <h1 style={styles.title}>Documents</h1>
          <p style={styles.subtitle}>Upload and manage CSVs, spreadsheets, PDFs, and other documents</p>
        </div>
      </div>

      <div style={styles.uploadSection}>
        <div
          style={{
            ...styles.dropZone,
            ...(dragActive ? styles.dropZoneActive : {}),
            ...(uploading ? styles.dropZoneUploading : {})
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            style={styles.fileInput}
            onChange={handleFileSelect}
            multiple
            accept=".csv,.xlsx,.xls,.ods,.pdf,.doc,.docx,.txt,.json"
            disabled={uploading}
          />
          <label htmlFor="file-upload" style={styles.uploadLabel}>
            {uploading ? (
              <>
                <div style={styles.uploadIcon}>⏳</div>
                <p style={styles.uploadText}>Uploading...</p>
              </>
            ) : (
              <>
                <div style={styles.uploadIcon}>📤</div>
                <p style={styles.uploadText}>
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p style={styles.uploadHint}>
                  CSV, Excel, PDF, Word, Text, JSON (Max 10MB)
                </p>
              </>
            )}
          </label>
        </div>

        <div style={styles.descriptionBox}>
          <label style={styles.label}>Optional Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for the uploaded files..."
            style={styles.input}
            disabled={uploading}
          />
        </div>
      </div>

      <div style={styles.documentsGrid}>
        {documents.length === 0 && !loading ? (
          <div style={styles.emptyState}>
            <p>No documents uploaded yet</p>
            <p style={styles.emptyHint}>Upload your first document using the area above</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} style={styles.documentCard}>
              <div style={styles.documentIcon}>
                {getFileIcon(doc.file_type)}
              </div>
              <div style={styles.documentInfo}>
                <div style={styles.documentName} title={doc.original_name}>
                  {doc.original_name}
                </div>
                {doc.description && (
                  <div style={styles.documentDescription}>{doc.description}</div>
                )}
                <div style={styles.documentMeta}>
                  {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                </div>
                {doc.uploaded_by && (
                  <div style={styles.documentUploader}>By {doc.uploaded_by}</div>
                )}
              </div>
              <div style={styles.documentActions}>
                <a
                  href={`https://chrispeterkins.com${doc.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.downloadButton}
                  download
                >
                  ⬇️ Download
                </a>
                <button
                  onClick={() => handleDelete(doc)}
                  style={styles.deleteButton}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
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
  uploadSection: {
    marginBottom: '32px',
  },
  dropZone: {
    border: '2px dashed #E0E0E0',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center' as const,
    backgroundColor: '#FAFAF8',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  dropZoneActive: {
    borderColor: '#8B4513',
    backgroundColor: '#FFF8F0',
  },
  dropZoneUploading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  uploadText: {
    fontSize: '16px',
    color: '#333',
    margin: '0 0 8px 0',
  },
  uploadHint: {
    fontSize: '14px',
    color: '#999',
    margin: 0,
  },
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    padding: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  documentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  documentIcon: {
    fontSize: '48px',
    textAlign: 'center' as const,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  documentDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  documentMeta: {
    fontSize: '12px',
    color: '#999',
    marginBottom: '4px',
  },
  documentUploader: {
    fontSize: '12px',
    color: '#8B4513',
  },
  documentActions: {
    display: 'flex',
    gap: '8px',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    color: '#FFFFFF',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFF',
    color: '#D32F2F',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #D32F2F',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  emptyState: {
    gridColumn: '1 / -1',
    padding: '48px',
    textAlign: 'center' as const,
    color: '#999',
  },
  emptyHint: {
    fontSize: '14px',
    color: '#BBB',
    marginTop: '8px',
  },
};
