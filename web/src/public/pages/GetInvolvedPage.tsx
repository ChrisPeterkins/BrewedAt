import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@shared/firebase.config';

type Tab = 'event' | 'contact';

export default function GetInvolvedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('event');
  const [formSelected, setFormSelected] = useState(false);
  const [eventFormData, setEventFormData] = useState({
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
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState<'event' | 'contact'>('event');

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setContactFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'events'), {
        ...eventFormData,
        eventDate: Timestamp.fromDate(new Date(eventFormData.eventDate)),
        eventType: 'local',
        approved: false,
        featured: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setSubmittedType('event');
      setSubmitted(true);
      setEventFormData({ name: '', description: '', eventDate: '', eventTime: '', location: '', address: '', organizerName: '', organizerEmail: '', organizerPhone: '', websiteUrl: '', ticketUrl: '' });
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('Error submitting event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'contactSubmissions'), {
        ...contactFormData,
        createdAt: Timestamp.now(),
        read: false,
      });
      setSubmittedType('contact');
      setSubmitted(true);
      setContactFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Error submitting your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.formContainer}>
            {!formSelected && !submitted ? (
              <div style={styles.buttonSelectionContainer}>
                <h2 style={styles.selectionTitle}>Get Involved</h2>
                <p style={styles.selectionSubtitle}>
                  Choose an option below to get started
                </p>
                <div style={styles.buttonGrid}>
                  <button
                    onClick={() => {
                      setActiveTab('event');
                      setFormSelected(true);
                    }}
                    style={styles.selectionButton}
                  >
                    <div style={styles.buttonIcon}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                    </div>
                    <h3 style={styles.buttonTitle}>Submit an Event</h3>
                    <p style={styles.buttonDescription}>
                      Share your upcoming beer-related event with the BrewedAt community
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('contact');
                      setFormSelected(true);
                    }}
                    style={styles.selectionButton}
                  >
                    <div style={styles.buttonIcon}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <h3 style={styles.buttonTitle}>Contact Us</h3>
                    <p style={styles.buttonDescription}>
                      Get in touch for partnerships, press inquiries, or general questions
                    </p>
                  </button>
                </div>
              </div>
            ) : submitted ? (
              <div style={styles.success}>
                <h2>Thank You!</h2>
                <p>
                  {submittedType === 'event'
                    ? 'Your event has been submitted and will be reviewed shortly.'
                    : 'Your message has been received. We\'ll get back to you soon!'}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormSelected(false);
                  }}
                  style={styles.submitButton}
                >
                  Back to Options
                </button>
              </div>
            ) : (
              <>
                {/* Back Button */}
                <button
                  onClick={() => setFormSelected(false)}
                  style={styles.backButton}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Options
                </button>

                {/* Submit Event Form */}
                {activeTab === 'event' && (
                  <form onSubmit={handleEventSubmit} style={styles.form}>
                    {/* Event Details Section */}
                    <div style={styles.formSection}>
                      <h3 style={styles.sectionTitle}>Event Details</h3>
                      <div style={styles.field}>
                        <label style={styles.label}>Event Name *</label>
                        <input type="text" name="name" value={eventFormData.name} onChange={handleEventChange} required style={styles.input} placeholder="Summer Beer Festival" />
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>Description *</label>
                        <textarea name="description" value={eventFormData.description} onChange={handleEventChange} required rows={4} style={styles.textarea} placeholder="Describe your event..." />
                      </div>

                      <div style={styles.row}>
                        <div style={styles.field}>
                          <label style={styles.label}>Date *</label>
                          <input type="date" name="eventDate" value={eventFormData.eventDate} onChange={handleEventChange} required style={styles.input} />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Time</label>
                          <input type="text" name="eventTime" value={eventFormData.eventTime} onChange={handleEventChange} placeholder="6:00 PM" style={styles.input} />
                        </div>
                      </div>
                    </div>

                    {/* Location Section */}
                    <div style={styles.formSection}>
                      <h3 style={styles.sectionTitle}>Location</h3>
                      <div style={styles.field}>
                        <label style={styles.label}>Venue Name *</label>
                        <input type="text" name="location" value={eventFormData.location} onChange={handleEventChange} required style={styles.input} placeholder="The Taproom" />
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>Full Address *</label>
                        <textarea name="address" value={eventFormData.address} onChange={handleEventChange} required rows={3} style={styles.textarea} placeholder="123 Main Street&#10;Philadelphia, PA 19103" />
                      </div>
                    </div>

                    {/* Event Links Section */}
                    <div style={styles.formSection}>
                      <h3 style={styles.sectionTitle}>Event Links</h3>
                      <div style={styles.row}>
                        <div style={styles.field}>
                          <label style={styles.label}>Website URL</label>
                          <input type="url" name="websiteUrl" value={eventFormData.websiteUrl} onChange={handleEventChange} placeholder="https://..." style={styles.input} />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Ticket URL</label>
                          <input type="url" name="ticketUrl" value={eventFormData.ticketUrl} onChange={handleEventChange} placeholder="https://..." style={styles.input} />
                        </div>
                      </div>
                    </div>

                    {/* Organizer Info Section */}
                    <div style={styles.formSection}>
                      <h3 style={styles.sectionTitle}>Your Contact Information</h3>
                      <div style={styles.row}>
                        <div style={styles.field}>
                          <label style={styles.label}>Your Name *</label>
                          <input type="text" name="organizerName" value={eventFormData.organizerName} onChange={handleEventChange} required style={styles.input} placeholder="John Doe" />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Email *</label>
                          <input type="email" name="organizerEmail" value={eventFormData.organizerEmail} onChange={handleEventChange} required style={styles.input} placeholder="john@example.com" />
                        </div>
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>Phone (optional)</label>
                        <input type="tel" name="organizerPhone" value={eventFormData.organizerPhone} onChange={handleEventChange} style={styles.input} placeholder="(555) 123-4567" />
                      </div>
                    </div>

                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                      {submitting ? 'Submitting...' : 'Submit Event'}
                    </button>
                  </form>
                )}

                {/* Contact Us Form */}
                {activeTab === 'contact' && (
                  <form onSubmit={handleContactSubmit} style={styles.form}>
                    <div style={styles.formSection}>
                      <h3 style={styles.sectionTitle}>Send Us a Message</h3>

                      <div style={styles.row}>
                        <div style={styles.field}>
                          <label style={styles.label}>Your Name *</label>
                          <input type="text" name="name" value={contactFormData.name} onChange={handleContactChange} required style={styles.input} placeholder="John Doe" />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Email *</label>
                          <input type="email" name="email" value={contactFormData.email} onChange={handleContactChange} required style={styles.input} placeholder="john@example.com" />
                        </div>
                      </div>

                      <div style={styles.row}>
                        <div style={styles.field}>
                          <label style={styles.label}>Phone (optional)</label>
                          <input type="tel" name="phone" value={contactFormData.phone} onChange={handleContactChange} style={styles.input} placeholder="(555) 123-4567" />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Subject *</label>
                          <select name="subject" value={contactFormData.subject} onChange={handleContactChange} required style={styles.input}>
                            <option value="general">General Inquiry</option>
                            <option value="partnership">Partnership Opportunity</option>
                            <option value="media">Media / Press</option>
                            <option value="sponsorship">Sponsorship</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>Message *</label>
                        <textarea name="message" value={contactFormData.message} onChange={handleContactChange} required rows={6} style={styles.textarea} placeholder="How can we help you?" />
                      </div>
                    </div>

                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  section: { padding: '60px 0' },
  formContainer: {
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  buttonSelectionContainer: {
    textAlign: 'center' as const,
    padding: '20px 0',
  },
  selectionTitle: {
    fontSize: '28px',
    fontWeight: '700' as const,
    color: '#654321',
    marginBottom: '12px',
  },
  selectionSubtitle: {
    fontSize: '16px',
    color: '#8B4513',
    marginBottom: '40px',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '32px',
  },
  selectionButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '40px 32px',
    backgroundColor: '#FFF9F0',
    border: '2px solid #E0E0E0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center' as const,
  },
  buttonIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  buttonTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#654321',
    marginBottom: '12px',
  },
  buttonDescription: {
    fontSize: '14px',
    color: '#8B4513',
    lineHeight: '1.6',
    margin: 0,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    color: '#8B4513',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'all 0.2s ease',
  },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  formSection: {
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
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600' as const, color: '#654321' },
  input: {
    padding: '12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical' as const
  },
  submitButton: {
    padding: '14px 32px',
    backgroundColor: '#D4922A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'background-color 0.3s ease',
  },
  success: { textAlign: 'center' as const, padding: '40px', color: '#654321' },
};
