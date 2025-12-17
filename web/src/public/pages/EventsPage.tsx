import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@shared/api-client';
import type { Event, Tag } from '@shared/api-client';
import { trackEventView } from '../utils/analytics';

// Tag category config
const TAG_CATEGORIES: Record<string, { label: string; color: string }> = {
  'entertainment': { label: 'Entertainment', color: '#9333EA' },
  'video-games': { label: 'Video Games', color: '#EF4444' },
  'beverages': { label: 'Beverages', color: '#F59E0B' },
  'event-focus': { label: 'Event Focus', color: '#3B82F6' },
  'activity': { label: 'Activity', color: '#14B8A6' },
  'sports': { label: 'Sports', color: '#F97316' },
};

// Date filter options
const DATE_FILTERS = [
  { id: 'all', label: 'All Dates' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'upcoming', label: 'Upcoming' },
];

// Event type filters
const TYPE_FILTERS = [
  { id: 'all', label: 'All Events' },
  { id: 'brewedat', label: 'BrewedAt Events' },
  { id: 'local', label: 'Local Events' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, tagsRes] = await Promise.all([
        apiClient.getEvents(),
        apiClient.getTags(),
      ]);

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }
      if (tagsRes.success && tagsRes.data) {
        setAllTags(tagsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on all criteria
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.brewery?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== 'all') {
        if (event.eventType !== typeFilter) return false;
      }

      // Date filter (quick filters)
      if (dateFilter !== 'all') {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        switch (dateFilter) {
          case 'today':
            if (eventDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'week':
            if (eventDate < today || eventDate > endOfWeek) return false;
            break;
          case 'month':
            if (eventDate < today || eventDate > endOfMonth) return false;
            break;
          case 'upcoming':
            if (eventDate < today) return false;
            break;
        }
      }

      // Custom date range filter
      if (startDate || endDate) {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (eventDate < start) return false;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (eventDate > end) return false;
        }
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const eventTagIds = event.tags?.map(t => t.id) || [];
        const hasMatchingTag = selectedTags.some(tagId => eventTagIds.includes(tagId));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [events, searchQuery, dateFilter, typeFilter, selectedTags, startDate, endDate]);

  // Separate featured and regular events
  const featuredEvents = filteredEvents.filter(e => e.featured === 1);
  const regularEvents = filteredEvents.filter(e => e.featured !== 1);

  // Group tags by category
  const tagsByCategory = useMemo(() => {
    return allTags.reduce((acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, Tag[]>);
  }, [allTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setTypeFilter('all');
    setSelectedTags([]);
    setStartDate('');
    setEndDate('');
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchQuery || dateFilter !== 'all' || typeFilter !== 'all' || selectedTags.length > 0 || startDate || endDate;

  const handleEventClick = async (event: Event) => {
    await trackEventView(event.id, event.title);
  };

  const EventCard = ({ event, featured = false }: { event: Event; featured?: boolean }) => {
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div
        className="event-card-split"
        style={{
          ...styles.eventCardSplit,
          ...(featured ? styles.featuredCardSplit : {}),
          opacity: isPast ? 0.7 : 1,
        }}
        onClick={() => handleEventClick(event)}
      >
        {/* Left Side - Image */}
        <div style={styles.eventImageSide}>
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} style={styles.eventImageFull} />
          ) : (
            <div style={styles.eventImagePlaceholderFull}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
          {event.featured === 1 && (
            <span className="featured-badge" style={styles.featuredBadgeOverlay}>Featured</span>
          )}
          {isPast && (
            <span className="past-badge" style={styles.pastBadgeOverlay}>Past Event</span>
          )}
        </div>

        {/* Right Side - Details (matching homepage design) */}
        <div className="event-details-card-new" style={styles.eventDetailsSide}>
          {/* Top Section */}
          <div className="event-details-top" style={styles.eventDetailsTop}>
            {/* Event Type Tag */}
            <span
              className="event-style-tag"
              style={{
                ...styles.eventStyleTag,
                background: event.eventType === 'brewedat' ? 'rgba(253, 85, 38, 0.15)' : 'rgba(31, 53, 64, 0.1)',
                color: event.eventType === 'brewedat' ? '#fd5526' : '#1f3540'
              }}
            >
              {event.eventType === 'brewedat' ? 'BREWEDAT' : 'LOCAL'}
            </span>

            {/* Event Title */}
            <h3 className="event-details-title" style={styles.eventDetailsTitle}>{event.title}</h3>

            {/* Brewery/Location Name */}
            {event.brewery && (
              <p className="event-details-brewery" style={styles.eventDetailsBrewery}>{event.brewery}</p>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="event-details-description" style={styles.eventDetailsDescription}>
              {event.description.length > 150
                ? event.description.substring(0, 150) + '...'
                : event.description}
            </p>
          )}

          {/* Tags/Highlights */}
          {event.tags && event.tags.length > 0 && (
            <div className="event-details-highlights" style={styles.eventDetailsHighlights}>
              {event.tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className="event-highlight-tag"
                  style={{
                    ...styles.eventHighlightTag,
                    backgroundColor: TAG_CATEGORIES[tag.category]?.color || '#6B7280',
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span style={styles.moreTagsLabel}>+{event.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="event-details-divider" style={styles.eventDetailsDivider} />

          {/* Details Grid */}
          <div className="event-details-grid" style={styles.eventDetailsGrid}>
            {/* Date & Time */}
            <div className="event-detail-item" style={styles.eventDetailItem}>
              <p className="event-detail-label" style={styles.eventDetailLabel}>Date & Time</p>
              <p className="event-detail-value" style={styles.eventDetailValue}>{formattedDate}</p>
              <p className="event-detail-subvalue" style={styles.eventDetailSubvalue}>{event.time || 'Time TBA'}</p>
            </div>

            {/* Location */}
            <div className="event-detail-item" style={styles.eventDetailItem}>
              <p className="event-detail-label" style={styles.eventDetailLabel}>Location</p>
              <p className="event-detail-value" style={styles.eventDetailValue}>
                {event.location || 'Location TBA'}
              </p>
              {event.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-detail-link"
                  style={styles.eventDetailLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  View on map
                </a>
              )}
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="event-details-cta" style={styles.eventDetailsCta}>
            {/* Price & Availability */}
            <div className="event-price-info" style={styles.eventPriceInfo}>
              <p className="event-price" style={styles.eventPrice}>
                Free
                <span className="event-price-note" style={styles.eventPriceNote}>to attend</span>
              </p>
              <p className="event-availability" style={styles.eventAvailability}>Open to all</p>
            </div>

            {/* CTA Button */}
            {event.externalUrl ? (
              <a
                href={event.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="event-cta-button"
                style={styles.eventCtaButton}
                onClick={(e) => e.stopPropagation()}
              >
                View Details
              </a>
            ) : (
              <span className="event-cta-button" style={styles.eventCtaButton}>
                View Details
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading events...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        .event-card-split:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
        }
        .event-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(253, 85, 38, 0.4) !important;
        }
        .event-detail-link:hover {
          color: #e04515 !important;
          text-decoration: underline;
        }
        .filter-chip:hover {
          background-color: rgba(253, 85, 38, 0.1) !important;
        }
        .filter-chip.active {
          background-color: #fd5526 !important;
          color: white !important;
          border-color: #fd5526 !important;
        }
        .tag-filter:hover {
          transform: scale(1.02);
        }
        .tag-filter.active {
          transform: scale(1.02);
        }
        .search-input-compact:focus {
          border-color: #fd5526 !important;
          box-shadow: 0 0 0 2px rgba(253, 85, 38, 0.1) !important;
          background-color: #ffffff !important;
        }
        .search-input-compact::placeholder {
          color: #9ca3af;
        }
        input[type="date"]:focus {
          border-color: #fd5526 !important;
          box-shadow: 0 0 0 2px rgba(253, 85, 38, 0.1) !important;
          background-color: #ffffff !important;
        }
        /* Grid goes to 1 column on smaller screens */
        @media (max-width: 1024px) {
          .events-grid {
            grid-template-columns: 1fr !important;
          }
        }
        /* Mobile responsiveness for split cards */
        @media (max-width: 640px) {
          .event-card-split {
            flex-direction: column !important;
            min-height: auto !important;
          }
          .event-card-split > div:first-child {
            width: 100% !important;
            min-width: auto !important;
            height: 180px !important;
          }
          .event-details-card-new {
            min-height: auto !important;
          }
          .event-details-grid {
            grid-template-columns: 1fr !important;
          }
          .event-details-cta {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .event-cta-button {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Compact Search & Filters Bar */}
      <section style={styles.compactFilterBar}>
        <div style={styles.container}>
          <div style={styles.filterBarRow}>
            {/* Search Input */}
            <div style={styles.searchWrapper}>
              <svg style={styles.searchIconCompact} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-compact"
                style={styles.searchInputCompact}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={styles.clearSearchCompact}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Date Filter Chips */}
            <div style={styles.dateChipsCompact}>
              {DATE_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  className={`filter-chip ${dateFilter === filter.id ? 'active' : ''}`}
                  style={styles.filterChipCompact}
                  onClick={() => {
                    setDateFilter(filter.id);
                    // Clear custom date range when using quick filters
                    if (filter.id !== 'all') {
                      setStartDate('');
                      setEndDate('');
                    }
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Date Range Picker */}
            <div style={styles.dateRangeWrapper}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilter('all'); // Clear quick filter when using date range
                }}
                style={styles.dateInput}
                placeholder="Start"
              />
              <span style={styles.dateRangeSeparator}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilter('all'); // Clear quick filter when using date range
                }}
                style={styles.dateInput}
                placeholder="End"
              />
              {(startDate || endDate) && (
                <button onClick={clearDateRange} style={styles.clearDateRange}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* More Filters Toggle */}
            <div style={styles.filterActions}>
              <button
                style={styles.filterToggleCompact}
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                More
                {hasActiveFilters && <span style={styles.filterBadgeCompact}>{selectedTags.length + (typeFilter !== 'all' ? 1 : 0)}</span>}
              </button>

              {hasActiveFilters && (
                <button style={styles.clearFiltersCompact} onClick={clearFilters}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div style={styles.expandedFiltersCompact}>
              {/* Event Type */}
              <div style={styles.filterGroupCompact}>
                <span style={styles.filterGroupLabel}>Type:</span>
                <div style={styles.filterOptionsInline}>
                  {TYPE_FILTERS.map(filter => (
                    <button
                      key={filter.id}
                      className={`filter-chip ${typeFilter === filter.id ? 'active' : ''}`}
                      style={styles.filterChipCompact}
                      onClick={() => setTypeFilter(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags by Category */}
              {Object.entries(tagsByCategory).map(([category, tags]) => (
                <div key={category} style={styles.filterGroupCompact}>
                  <span style={{ ...styles.filterGroupLabel, color: TAG_CATEGORIES[category]?.color }}>
                    {TAG_CATEGORIES[category]?.label || category}:
                  </span>
                  <div style={styles.filterOptionsInline}>
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        className={`tag-filter ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                        style={{
                          ...styles.tagFilterCompact,
                          backgroundColor: selectedTags.includes(tag.id)
                            ? TAG_CATEGORIES[tag.category]?.color
                            : 'transparent',
                          color: selectedTags.includes(tag.id)
                            ? '#fff'
                            : TAG_CATEGORIES[tag.category]?.color,
                          borderColor: TAG_CATEGORIES[tag.category]?.color,
                        }}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Results Count */}
      <section style={styles.resultsSection}>
        <div style={styles.container}>
          <p style={styles.resultsCount}>
            {filteredEvents.length === 0
              ? 'No events found'
              : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
            {hasActiveFilters && ' with current filters'}
          </p>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section style={styles.eventsSection}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fd5526" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Featured Events
            </h2>
            <div className="events-grid" style={styles.eventsGrid}>
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Events */}
      {regularEvents.length > 0 && (
        <section style={styles.eventsSection}>
          <div style={styles.container}>
            {featuredEvents.length > 0 && (
              <h2 style={styles.sectionTitle}>All Events</h2>
            )}
            <div className="events-grid" style={styles.eventsGrid}>
              {regularEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <section style={styles.noResultsSection}>
          <div style={styles.container}>
            <div style={styles.noResults}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <path d="M8 8l6 6M14 8l-6 6"/>
              </svg>
              <h3 style={styles.noResultsTitle}>No events found</h3>
              <p style={styles.noResultsText}>
                Try adjusting your filters or search query
              </p>
              <button style={styles.clearFiltersButtonLarge} onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Submit Event CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.ctaCard}>
            <div style={styles.ctaContent}>
              <h2 style={styles.ctaTitle}>Have an Event to Share?</h2>
              <p style={styles.ctaText}>
                Hosting an event at a craft beverage location or local bar? Get it featured on BrewedAt and reach our community!
              </p>
            </div>
            <a href="/brewedat/submit-event" style={styles.ctaButton}>
              Submit Your Event
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 16,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    border: '3px solid #e5e7eb',
    borderTopColor: '#fd5526',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },

  // Compact Filter Bar
  compactFilterBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  filterBarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '0 0 360px',
    minWidth: 240,
  },
  searchIconCompact: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  searchInputCompact: {
    width: '100%',
    padding: '14px 40px 14px 44px',
    fontSize: 15,
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    outline: 'none',
  },
  clearSearchCompact: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#9ca3af',
  },
  dateChipsCompact: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  dateRangeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dateInput: {
    padding: '8px 10px',
    fontSize: 13,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    outline: 'none',
    width: 130,
  },
  dateRangeSeparator: {
    fontSize: 12,
    color: '#6b7280',
  },
  clearDateRange: {
    background: 'transparent',
    border: 'none',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#9ca3af',
  },
  filterChipCompact: {
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  filterActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  filterToggleCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
  },
  filterBadgeCompact: {
    backgroundColor: '#fd5526',
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    padding: '1px 5px',
    borderRadius: 8,
    marginLeft: 2,
  },
  clearFiltersCompact: {
    padding: '6px 10px',
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  expandedFiltersCompact: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  filterGroupCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterGroupLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    minWidth: 80,
  },
  filterOptionsInline: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagFilterCompact: {
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  },
  // Results
  resultsSection: {
    padding: '10px 0',
    backgroundColor: '#f8f9fa',
  },
  resultsCount: {
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
  },

  // Events Section
  eventsSection: {
    padding: '20px 0',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 20,
    fontWeight: 700,
    color: '#1f3540',
    marginBottom: 16,
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
  },

  // Event Card - Split Layout (Image left, Details right)
  eventCardSplit: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    minHeight: 280,
  },
  featuredCardSplit: {
    boxShadow: '0 4px 20px rgba(253, 85, 38, 0.15)',
    border: '2px solid rgba(253, 85, 38, 0.2)',
  },

  // Left side - Image
  eventImageSide: {
    position: 'relative',
    width: '40%',
    minWidth: 160,
    backgroundColor: '#f3f4f6',
    flexShrink: 0,
  },
  eventImageFull: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  eventImagePlaceholderFull: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  featuredBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fd5526',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  pastBadgeOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },

  // Right side - Details (matching homepage design)
  eventDetailsSide: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    minHeight: 280,
  },
  eventDetailsTop: {
    marginBottom: 10,
    flexShrink: 0,
  },
  eventStyleTag: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.5px',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  eventDetailsTitle: {
    color: '#1f3540',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 4px 0',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  eventDetailsBrewery: {
    color: '#fd5526',
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  eventDetailsDescription: {
    color: '#25303d',
    fontSize: 12,
    lineHeight: 1.5,
    margin: '0 0 10px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flexShrink: 0,
  },
  eventDetailsHighlights: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
    flexShrink: 0,
  },
  eventHighlightTag: {
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 500,
  },
  moreTagsLabel: {
    padding: '4px 8px',
    fontSize: 10,
    fontWeight: 500,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  eventDetailsDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    margin: '0 0 10px 0',
    flexShrink: 0,
  },
  eventDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 10,
    flexShrink: 0,
  },
  eventDetailItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  eventDetailLabel: {
    color: '#25303d',
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    margin: '0 0 3px 0',
  },
  eventDetailValue: {
    color: '#1f3540',
    fontSize: 12,
    fontWeight: 600,
    margin: '0 0 1px 0',
  },
  eventDetailSubvalue: {
    color: '#25303d',
    fontSize: 11,
    margin: 0,
  },
  eventDetailLink: {
    color: '#fd5526',
    fontSize: 11,
    margin: 0,
    textDecoration: 'none',
    fontWeight: 500,
  },
  eventDetailsCta: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTop: '1px solid #e0e0e0',
    gap: 8,
    flexShrink: 0,
  },
  eventPriceInfo: {
    flexShrink: 0,
  },
  eventPrice: {
    color: '#1f3540',
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    lineHeight: 1,
  },
  eventPriceNote: {
    fontSize: 11,
    fontWeight: 400,
    color: '#25303d',
    marginLeft: 3,
  },
  eventAvailability: {
    color: '#25303d',
    fontSize: 10,
    fontWeight: 500,
    margin: '2px 0 0 0',
  },
  eventCtaButton: {
    padding: '8px 16px',
    backgroundColor: '#fd5526',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(253, 85, 38, 0.3)',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },

  // No Results
  noResultsSection: {
    padding: '60px 0',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 24px',
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
  },
  clearFiltersButtonLarge: {
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fd5526',
    backgroundColor: 'transparent',
    border: '2px solid #fd5526',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // CTA Section
  ctaSection: {
    padding: '60px 0',
    backgroundColor: '#f8f9fa',
  },
  ctaCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    padding: '40px 48px',
    backgroundColor: '#1f3540',
    borderRadius: 20,
    flexWrap: 'wrap',
  },
  ctaContent: {
    flex: 1,
    minWidth: 280,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.6,
    margin: 0,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 32px',
    fontSize: 16,
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#fd5526',
    borderRadius: 12,
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  },
};
