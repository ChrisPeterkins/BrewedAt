import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'general' | 'partnership' | 'media' | 'sponsorship' | 'other'>('all');
  const [sortField, setSortField] = useState<'createdAt' | 'name'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const submissionsRef = collection(db, 'contactSubmissions');
      const q = query(submissionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const submissionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ContactSubmission[];
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      alert('Failed to load contact submissions');
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await deleteDoc(doc(db, 'contactSubmissions', submissionId));
      alert('Submission deleted successfully!');
      loadSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  const toggleRead = async (submission: ContactSubmission) => {
    try {
      await updateDoc(doc(db, 'contactSubmissions', submission.id), {
        read: !submission.read
      });
      loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      general: 'General Inquiry',
      partnership: 'Partnership',
      media: 'Media / Press',
      sponsorship: 'Sponsorship',
      other: 'Other'
    };
    return labels[subject] || subject;
  };

  // Filter and sort submissions
  const filteredAndSortedSubmissions = submissions
    .filter(submission => {
      const matchesSearch =
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unread' && !submission.read) ||
        (statusFilter === 'read' && submission.read);
      const matchesSubject = subjectFilter === 'all' || submission.subject === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'createdAt') {
        comparison = a.createdAt.toMillis() - b.createdAt.toMillis();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'createdAt' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const unreadCount = submissions.filter(s => !s.read).length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#654321' }}>
            Contact Submissions ({unreadCount > 0 && `${unreadCount} unread`})
          </h1>
          <p style={{ margin: 0, color: '#8B4513', fontSize: '14px' }}>
            Manage contact form submissions from the Get Involved page
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
          All Submissions ({submissions.length})
        </h2>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search submissions..."
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'unread' | 'read')}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="all">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value as any)}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="all">All Subjects</option>
            <option value="general">General Inquiry</option>
            <option value="partnership">Partnership</option>
            <option value="media">Media / Press</option>
            <option value="sponsorship">Sponsorship</option>
            <option value="other">Other</option>
          </select>
        </div>

        {submissions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No submissions yet.
          </p>
        ) : filteredAndSortedSubmissions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No submissions match your filters.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321', width: '60px' }}>Status</th>
                  <th
                    onClick={() => handleSort('name')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#654321',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    From {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Subject</th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#654321',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSubmissions.map((submission) => (
                  <tr key={submission.id} style={{ borderBottom: '1px solid #eee', backgroundColor: submission.read ? 'white' : '#FFF9F0' }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleRead(submission)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: submission.read ? '#E8F5E9' : '#FFEBEE',
                          color: submission.read ? '#2E7D32' : '#C62828',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {submission.read ? 'Read' : 'Unread'}
                      </button>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{submission.name}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {submission.email}
                        {submission.phone && ` • ${submission.phone}`}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                        {submission.message}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#E8F5E9',
                        color: '#2E7D32',
                      }}>
                        {getSubjectLabel(submission.subject)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                      {formatDate(submission.createdAt)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(submission.id)}
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
