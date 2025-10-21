import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@shared/firebase.config';

export async function trackEventView(eventId: string, eventName: string): Promise<void> {
  try {
    await addDoc(collection(db, 'eventViews'), {
      eventId,
      eventName,
      timestamp: Timestamp.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
    });
  } catch (error) {
    // Silently fail - don't block the user experience
    console.error('Error tracking event view:', error);
  }
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}
