import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase.config';
import type { Event, EventFormData } from '@shared/types';

const INITIAL_FORM_DATA: EventFormData = {
  name: '',
  description: '',
  eventDate: null,
  eventTime: '',
  location: '',
  address: '',
  eventType: 'local',
  organizerName: '',
  organizerEmail: '',
  organizerPhone: '',
  websiteUrl: '',
  ticketUrl: '',
  imageUrl: '',
  approved: true,
  featured: false,
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM_DATA);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load events
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('eventDate', 'desc'));
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      alert('Failed to load events');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'date') {
      setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.imageUrl;

    setUploadingImage(true);
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `events/${timestamp}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image if provided
      const imageUrl = await uploadImage();

      const eventData = {
        ...formData,
        eventDate: formData.eventDate ? Timestamp.fromDate(formData.eventDate) : Timestamp.now(),
        imageUrl,
        createdAt: editingEvent?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (editingEvent) {
        // Update existing event
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        alert('✅ Event updated successfully!');
      } else {
        // Create new event
        await addDoc(collection(db, 'events'), eventData);
        alert('✅ Event created successfully!');
      }

      // Reset form and reload
      setFormData(INITIAL_FORM_DATA);
      setEditingEvent(null);
      setShowForm(false);
      setImageFile(null);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('❌ Failed to save event: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      eventDate: event.eventDate.toDate(),
      eventTime: event.eventTime || '',
      location: event.location,
      address: event.address,
      eventType: event.eventType,
      organizerName: event.organizerName,
      organizerEmail: event.organizerEmail,
      organizerPhone: event.organizerPhone || '',
      websiteUrl: event.websiteUrl || '',
      ticketUrl: event.ticketUrl || '',
      imageUrl: event.imageUrl || '',
      approved: event.approved,
      featured: event.featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      alert('✅ Event deleted successfully!');
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('❌ Failed to delete event');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#654321' }}>Events Management</h1>
          <p style={{ margin: 0, color: '#8B4513', fontSize: '14px' }}>
            Manage events displayed on the public website
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingEvent(null);
            setFormData(INITIAL_FORM_DATA);
            setImageFile(null);
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: showForm ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Event'}
        </button>
      </div>

      {/* Event Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px',
        }}>
          <h2 style={{ marginTop: 0, color: '#654321' }}>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Event Name *
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Event Type *
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="brewedat">BrewedAt Event</option>
                    <option value="local">Local Event</option>
                  </select>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Event Date *
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate ? formData.eventDate.toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Event Time
                  <input
                    type="text"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 6:00 PM"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Description *
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Location/Venue Name *
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Love City Brewing"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Address *
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main St, Philadelphia, PA"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Organizer Name *
                  <input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Organizer Email *
                  <input
                    type="email"
                    name="organizerEmail"
                    value={formData.organizerEmail}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Organizer Phone
                  <input
                    type="tel"
                    name="organizerPhone"
                    value={formData.organizerPhone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Website URL
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Ticket URL
                  <input
                    type="url"
                    name="ticketUrl"
                    value={formData.ticketUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Event Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  {formData.imageUrl && !imageFile && (
                    <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Current image: <a href={formData.imageUrl} target="_blank" rel="noopener noreferrer">View</a>
                    </p>
                  )}
                </label>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="approved"
                    checked={formData.approved}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: '#654321' }}>Approved (Show on website)</span>
                </label>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: '#654321' }}>Featured Event</span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                style={{
                  padding: '12px 32px',
                  backgroundColor: loading || uploadingImage ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || uploadingImage ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                {loading ? 'Saving...' : uploadingImage ? 'Uploading Image...' : editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  setFormData(INITIAL_FORM_DATA);
                  setImageFile(null);
                }}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
          All Events ({events.length})
        </h2>

        {events.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No events yet. Create your first event above!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Event</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Location</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{event.name}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {event.description.substring(0, 60)}...
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {formatDate(event.eventDate)}
                      {event.eventTime && (
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>{event.eventTime}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>{event.location}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: event.eventType === 'brewedat' ? '#FFF3E0' : '#E8F5E9',
                        color: event.eventType === 'brewedat' ? '#E65100' : '#2E7D32',
                      }}>
                        {event.eventType === 'brewedat' ? 'BrewedAt' : 'Local'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: event.approved ? '#E8F5E9' : '#FFEBEE',
                          color: event.approved ? '#2E7D32' : '#C62828',
                        }}>
                          {event.approved ? 'Approved' : 'Pending'}
                        </span>
                        {event.featured && (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: '#FFF3E0',
                            color: '#E65100',
                          }}>
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(event)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
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
                      </div>
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
