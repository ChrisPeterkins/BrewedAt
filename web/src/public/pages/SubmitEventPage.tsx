import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@shared/firebase.config';

export default function SubmitEventPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    address: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    websiteUrl: '',
    ticketUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
        eventType: 'local',
        approved: false,
        featured: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setSubmitted(true);
      setFormData({ name: '', description: '', eventDate: '', eventTime: '', location: '', address: '', organizerName: '', organizerEmail: '', organizerPhone: '', websiteUrl: '', ticketUrl: '' });
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('Error submitting event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>Submit an Event</h1>
          <p style={styles.subtitle}>
            Have your event featured on BrewedAt
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.formContainer}>
            {submitted ? (
              <div style={styles.success}>
                <h2>Thank You!</h2>
                <p>Your event has been submitted and will be reviewed shortly.</p>
                <button onClick={() => setSubmitted(false)} style={styles.submitButton}>
                  Submit Another Event
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Event Details Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Event Details</h3>
                  <div style={styles.field}>
                    <label style={styles.label}>Event Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} placeholder="Summer Beer Festival" />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Description *</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} style={styles.textarea} placeholder="Describe your event..." />
                  </div>

                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Date *</label>
                      <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required style={styles.input} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Time</label>
                      <input type="text" name="eventTime" value={formData.eventTime} onChange={handleChange} placeholder="6:00 PM" style={styles.input} />
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Location</h3>
                  <div style={styles.field}>
                    <label style={styles.label}>Venue Name *</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required style={styles.input} placeholder="The Taproom" />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Full Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} style={styles.textarea} placeholder="123 Main Street&#10;Philadelphia, PA 19103" />
                  </div>
                </div>

                {/* Event Links Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Event Links</h3>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Website URL</label>
                      <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://..." style={styles.input} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Ticket URL</label>
                      <input type="url" name="ticketUrl" value={formData.ticketUrl} onChange={handleChange} placeholder="https://..." style={styles.input} />
                    </div>
                  </div>
                </div>

                {/* Organizer Info Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Your Contact Information</h3>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Your Name *</label>
                      <input type="text" name="organizerName" value={formData.organizerName} onChange={handleChange} required style={styles.input} placeholder="John Doe" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Email *</label>
                      <input type="email" name="organizerEmail" value={formData.organizerEmail} onChange={handleChange} required style={styles.input} placeholder="john@example.com" />
                    </div>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Phone (optional)</label>
                    <input type="tel" name="organizerPhone" value={formData.organizerPhone} onChange={handleChange} style={styles.input} placeholder="(555) 123-4567" />
                  </div>
                </div>

                <button type="submit" disabled={submitting} style={styles.submitButton}>
                  {submitting ? 'Submitting...' : 'Submit Event'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  header: { backgroundColor: '#FFF3E0', padding: '60px 0', textAlign: 'center' as const },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  title: { fontSize: '42px', fontWeight: '700' as const, color: '#654321', marginBottom: '16px' },
  subtitle: { fontSize: '18px', color: '#8B4513' },
  section: {
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '1px solid #E0E0E0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#654321',
    marginBottom: '20px',
  },
  formContainer: { maxWidth: '700px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600' as const, color: '#654321' },
  input: { padding: '12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit' },
  textarea: { padding: '12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' as const },
  submitButton: { padding: '14px 32px', backgroundColor: '#D4922A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600' as const, cursor: 'pointer', marginTop: '12px' },
  success: { textAlign: 'center' as const, padding: '40px', color: '#654321' },
};
