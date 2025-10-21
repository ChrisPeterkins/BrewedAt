import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';

export async function checkAchievements(userId, userData) {
  const newAchievements = [];
  const existingAchievements = userData.achievements || [];

  const checkinsQuery = query(
    collection(db, 'checkins'),
    where('userId', '==', userId)
  );
  const checkinsSnapshot = await getDocs(checkinsQuery);
  const allCheckins = checkinsSnapshot.docs.map(doc => doc.data());

  if (!existingAchievements.includes('first_checkin') && allCheckins.length >= 1) {
    newAchievements.push('first_checkin');
  }

  const uniqueBreweries = new Set(allCheckins.map(c => c.breweryId));
  if (!existingAchievements.includes('social_butterfly') && uniqueBreweries.size >= 10) {
    newAchievements.push('social_butterfly');
  }

  const breweryCheckinsMap = {};
  allCheckins.forEach(checkin => {
    breweryCheckinsMap[checkin.breweryId] = (breweryCheckinsMap[checkin.breweryId] || 0) + 1;
  });
  const hasLoyalPatron = Object.values(breweryCheckinsMap).some(count => count >= 5);
  if (!existingAchievements.includes('loyal_patron') && hasLoyalPatron) {
    newAchievements.push('loyal_patron');
  }

  if (!existingAchievements.includes('beer_connoisseur') && userData.level >= 5) {
    newAchievements.push('beer_connoisseur');
  }

  const weekendCheckins = allCheckins.filter(checkin => {
    if (!checkin.timestamp || !checkin.timestamp.toDate) return false;
    const date = checkin.timestamp.toDate();
    const day = date.getDay();
    return day === 0 || day === 6;
  });

  const weekendMap = {};
  weekendCheckins.forEach(checkin => {
    if (!checkin.timestamp || !checkin.timestamp.toDate) return;
    const date = checkin.timestamp.toDate();
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekOfYear = Math.floor(dayOfYear / 7);
    const key = `${year}-${weekOfYear}`;
    weekendMap[key] = (weekendMap[key] || 0) + 1;
  });

  const hasWeekendWarrior = Object.values(weekendMap).some(count => count >= 3);
  if (!existingAchievements.includes('weekend_warrior') && hasWeekendWarrior) {
    newAchievements.push('weekend_warrior');
  }

  const eventsSnapshot = await getDocs(collection(db, 'events'));
  const allStyles = new Set();
  allCheckins.forEach(checkin => {
    const event = eventsSnapshot.docs.find(doc => doc.id === checkin.breweryId);
    if (event && event.data().styles) {
      event.data().styles.forEach(style => allStyles.add(style));
    }
  });

  if (!existingAchievements.includes('style_explorer') && allStyles.size >= 5) {
    newAchievements.push('style_explorer');
  }

  return newAchievements;
}