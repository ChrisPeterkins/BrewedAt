import { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client';
import type { Event } from '@shared/api-client';

interface EventFormData {
  name: string;
  description: string;
  eventDate: Date | null;
  eventTime: string;
  location: string;
  address: string;
  eventType: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  websiteUrl: string;
  ticketUrl: string;
  imageUrl: string;
  approved: boolean;
  featured: boolean;
}

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

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'brewedat' | 'local'>('all');
  const [sortField, setSortField] = useState<'name' | 'eventDate' | 'location'>('eventDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load events
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await apiClient.getEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        console.error('Error loading events:', response.error);
        alert('Failed to load events: ' + (response.error || 'Unknown error'));
      }
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

  const uploadImage = async (eventId: string): Promise<string> => {
    if (!imageFile) return formData.imageUrl;

    setUploadingImage(true);
    try {
      const response = await apiClient.uploadEventImage(eventId, imageFile);
      if (response.success && response.data) {
        return response.data.imageUrl;
      } else {
        throw new Error(response.error || 'Failed to upload image');
      }
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
      // Transform form data to API format
      const apiData = {
        title: formData.name,
        description: formData.description,
        date: formData.eventDate ? formData.eventDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: formData.eventTime || null,
        location: formData.address,
        brewery: formData.location,
        eventType: formData.eventType,
        imageUrl: formData.imageUrl,
        externalUrl: formData.websiteUrl || formData.ticketUrl || null,
        featured: formData.featured ? 1 : 0,
      };

      let response;
      let eventId = editingEvent?.id;

      if (editingEvent) {
        // Update existing event
        response = await apiClient.updateEvent(editingEvent.id, apiData);
        if (!response.success) throw new Error(response.error);
        alert('Event updated successfully!');
      } else {
        // Create new event
        response = await apiClient.createEvent(apiData);
        if (!response.success || !response.data) throw new Error(response.error);
        eventId = response.data.id;
        alert('Event created successfully!');
      }

      // Upload image if provided and we have an event ID
      if (imageFile && eventId) {
        await uploadImage(eventId);
      }

      // Reset form and reload
      setFormData(INITIAL_FORM_DATA);
      setEditingEvent(null);
      setShowForm(false);
      setImageFile(null);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.title,
      description: event.description || '',
      eventDate: new Date(event.date),
      eventTime: event.time || '',
      location: event.brewery || '',
      address: event.location || '',
      eventType: event.eventType || 'local',
      organizerName: '',
      organizerEmail: '',
      organizerPhone: '',
      websiteUrl: event.externalUrl || '',
      ticketUrl: '',
      imageUrl: event.imageUrl || '',
      approved: true,
      featured: event.featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await apiClient.deleteEvent(eventId);
      if (response.success) {
        alert('Event deleted successfully!');
        loadEvents();
      } else {
        alert('Failed to delete event: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter and sort events
  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && true) ||
        (statusFilter === 'pending' && false);
      const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'eventDate') {
        const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
        const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortField === 'location') {
        comparison = a.location.localeCompare(b.location);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'name' | 'eventDate' | 'location') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search events..."
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'approved' | 'pending')}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'brewedat' | 'local')}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="all">All Types</option>
            <option value="brewedat">BrewedAt Only</option>
            <option value="local">Local Only</option>
          </select>
        </div>

        {events.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No events yet. Create your first event above!
          </p>
        ) : filteredAndSortedEvents.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No events match your filters.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
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
                    Event {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('eventDate')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#654321',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Date {sortField === 'eventDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('location')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#654321',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEvents.map((event) => (
                  <tr key={event.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{event.title}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {event.description ? event.description.substring(0, 60) + '...' : 'No description'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {formatDate(event.date)}
                      {event.time && (
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>{event.time}</div>
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
                          backgroundColor: '#E8F5E9',
                          color: '#2E7D32',
                        }}>
                          Approved
                        </span>
                        {event.featured === 1 && (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: '#FFF3E0',
                            color: '#E65100',
                          }}>
                            Featured
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
