import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@shared/firebase.config';

type Tab = 'event' | 'contact';

export default function GetInvolvedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('event');
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
      <section style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>Get Involved</h1>
          <p style={styles.subtitle}>
            Submit an event or get in touch with us
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.formContainer}>
            {/* Tab Buttons */}
            <div style={styles.tabContainer}>
              <button
                onClick={() => { setActiveTab('event'); setSubmitted(false); }}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'event' ? styles.activeTab : {}),
                }}
              >
                Submit an Event
              </button>
              <button
                onClick={() => { setActiveTab('contact'); setSubmitted(false); }}
                style={{
                  ...styles.tab,
                  ...(activeTab === 'contact' ? styles.activeTab : {}),
                }}
              >
                Contact Us
              </button>
            </div>

            {submitted ? (
              <div style={styles.success}>
                <h2>Thank You!</h2>
                <p>
                  {submittedType === 'event'
                    ? 'Your event has been submitted and will be reviewed shortly.'
                    : 'Your message has been received. We\'ll get back to you soon!'}
                </p>
                <button onClick={() => setSubmitted(false)} style={styles.submitButton}>
                  {submittedType === 'event' ? 'Submit Another Event' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <>
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
  header: { backgroundColor: '#FFF3E0', padding: '60px 0', textAlign: 'center' as const },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  title: { fontSize: '42px', fontWeight: '700' as const, color: '#654321', marginBottom: '16px' },
  subtitle: { fontSize: '18px', color: '#8B4513' },
  section: { padding: '60px 0' },
  formContainer: {
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    borderBottom: '2px solid #E0E0E0',
    paddingBottom: '0',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: '#8B4513',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '-2px',
  },
  activeTab: {
    color: '#D4922A',
    borderBottomColor: '#D4922A',
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
