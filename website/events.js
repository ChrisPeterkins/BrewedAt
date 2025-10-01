import { db } from './firebase.config.js';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

// Format date for display
function formatDate(timestamp) {
    if (!timestamp) return 'TBA';

    let date;
    if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        return 'TBA';
    }

    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return { month, day };
}

// Create event card HTML
function createEventCard(event, isBrewedAtEvent = true) {
    const dateInfo = formatDate(event.eventDate || event.date);
    const eventName = event.name || event.eventName || 'Unnamed Event';
    const description = event.description || event.eventDescription || 'No description available';
    const location = event.address || event.location || 'Location TBA';
    const websiteUrl = event.websiteUrl || event.url || '#';

    return `
        <div class="event-card">
            <div class="event-date-badge">
                <div class="date-month">${dateInfo.month || 'TBA'}</div>
                <div class="date-day">${dateInfo.day || '?'}</div>
            </div>
            <div class="event-details">
                <h3>${eventName}</h3>
                <p class="event-description">${description}</p>
                <div class="event-meta">
                    <span class="event-location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        ${location}
                    </span>
                    ${event.eventTime ? `<span class="event-time">${event.eventTime}</span>` : ''}
                </div>
                ${websiteUrl !== '#' ? `<a href="${websiteUrl}" class="event-link" target="_blank" rel="noopener">Learn More →</a>` : ''}
            </div>
        </div>
    `;
}

// Load events from Firestore
async function loadEvents() {
    const brewedAtEventsContainer = document.getElementById('brewedat-events');
    const localEventsContainer = document.getElementById('local-events');

    // Show loading state
    if (brewedAtEventsContainer) {
        brewedAtEventsContainer.innerHTML = '<p style="text-align: center; color: #8B4513;">Loading events...</p>';
    }
    if (localEventsContainer) {
        localEventsContainer.innerHTML = '<p style="text-align: center; color: #8B4513;">Loading events...</p>';
    }

    try {
        // Fetch all events from Firestore
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);

        const brewedAtEvents = [];
        const localEvents = [];

        eventsSnapshot.forEach((doc) => {
            const eventData = { id: doc.id, ...doc.data() };

            // Only show approved events or events without approval field (legacy)
            const isApproved = eventData.approved !== false && eventData.status !== 'pending';

            if (isApproved) {
                // Categorize events - if it has eventType field, use that, otherwise check name/description
                const isBrewedAtEvent = eventData.eventType === 'brewedat' ||
                                       eventData.organizerName === 'BrewedAt' ||
                                       (eventData.name && eventData.name.includes('BrewedAt'));

                if (isBrewedAtEvent) {
                    brewedAtEvents.push(eventData);
                } else {
                    localEvents.push(eventData);
                }
            }
        });

        // Sort events by date (upcoming first)
        const sortByDate = (a, b) => {
            const dateA = a.eventDate || a.date;
            const dateB = b.eventDate || b.date;
            if (!dateA) return 1;
            if (!dateB) return -1;

            const timeA = dateA.toDate ? dateA.toDate().getTime() : new Date(dateA).getTime();
            const timeB = dateB.toDate ? dateB.toDate().getTime() : new Date(dateB).getTime();
            return timeA - timeB;
        };

        brewedAtEvents.sort(sortByDate);
        localEvents.sort(sortByDate);

        // Render BrewedAt events
        if (brewedAtEventsContainer) {
            if (brewedAtEvents.length === 0) {
                brewedAtEventsContainer.innerHTML = `
                    <div class="no-events">
                        <p>No BrewedAt events scheduled at the moment. Check back soon!</p>
                    </div>
                `;
            } else {
                brewedAtEventsContainer.innerHTML = brewedAtEvents
                    .map(event => createEventCard(event, true))
                    .join('');
            }
        }

        // Render local events
        if (localEventsContainer) {
            if (localEvents.length === 0) {
                localEventsContainer.innerHTML = `
                    <div class="no-events">
                        <p>No local events available. <a href="/submit-event.html">Submit an event</a> to get featured!</p>
                    </div>
                `;
            } else {
                localEventsContainer.innerHTML = localEvents
                    .map(event => createEventCard(event, false))
                    .join('');
            }
        }

    } catch (error) {
        console.error('Error loading events:', error);
        const errorMessage = '<p style="text-align: center; color: #D32F2F;">Error loading events. Please try again later.</p>';

        if (brewedAtEventsContainer) {
            brewedAtEventsContainer.innerHTML = errorMessage;
        }
        if (localEventsContainer) {
            localEventsContainer.innerHTML = errorMessage;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadEvents);
