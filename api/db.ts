import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../brewedat.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// ============================================================================
// EVENTS
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  brewery?: string;
  breweryLogo?: string;
  eventType?: string;
  imageUrl?: string;
  externalUrl?: string;
  featured: number;
  createdAt: string;
  updatedAt: string;
}

export const eventsDb = {
  getAll: (featured?: boolean, limit?: number, offset?: number) => {
    let query = 'SELECT * FROM events';
    const params: any[] = [];

    if (featured !== undefined) {
      query += ' WHERE featured = ?';
      params.push(featured ? 1 : 0);
    }

    query += ' ORDER BY date DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return db.prepare(query).all(...params) as Event[];
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Event | undefined;
  },

  create: (event: Omit<Event, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO events (id, title, description, date, time, location, brewery,
        breweryLogo, eventType, imageUrl, externalUrl, featured, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.id,
      event.title,
      event.description || null,
      event.date,
      event.time || null,
      event.location || null,
      event.brewery || null,
      event.breweryLogo || null,
      event.eventType || null,
      event.imageUrl || null,
      event.externalUrl || null,
      event.featured,
      now,
      now
    );

    return { ...event, createdAt: now, updatedAt: now };
  },

  update: (id: string, event: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(event).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// ============================================================================
// PODCAST EPISODES
// ============================================================================

export interface PodcastEpisode {
  id: string;
  title: string;
  description?: string;
  publishDate: string;
  duration?: string;
  audioUrl?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  featured: number;
  createdAt: string;
  updatedAt: string;
}

export const podcastDb = {
  getAll: (featured?: boolean, limit?: number, offset?: number) => {
    let query = 'SELECT * FROM podcast_episodes';
    const params: any[] = [];

    if (featured !== undefined) {
      query += ' WHERE featured = ?';
      params.push(featured ? 1 : 0);
    }

    query += ' ORDER BY publishDate DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return db.prepare(query).all(...params) as PodcastEpisode[];
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM podcast_episodes WHERE id = ?').get(id) as PodcastEpisode | undefined;
  },

  create: (episode: Omit<PodcastEpisode, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO podcast_episodes (id, title, description, publishDate, duration,
        audioUrl, imageUrl, spotifyUrl, appleUrl, youtubeUrl, featured, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      episode.id,
      episode.title,
      episode.description || null,
      episode.publishDate,
      episode.duration || null,
      episode.audioUrl || null,
      episode.imageUrl || null,
      episode.spotifyUrl || null,
      episode.appleUrl || null,
      episode.youtubeUrl || null,
      episode.featured,
      now,
      now
    );

    return { ...episode, createdAt: now, updatedAt: now };
  },

  update: (id: string, episode: Partial<Omit<PodcastEpisode, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(episode).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`UPDATE podcast_episodes SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM podcast_episodes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// ============================================================================
// RAFFLES
// ============================================================================

export interface Raffle {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  prizeDetails?: string;
  rules?: string;
  active: number;
  winnerAnnounced: number;
  createdAt: string;
  updatedAt: string;
}

export const rafflesDb = {
  getAll: (active?: boolean, limit?: number, offset?: number) => {
    let query = 'SELECT * FROM raffles';
    const params: any[] = [];

    if (active !== undefined) {
      query += ' WHERE active = ?';
      params.push(active ? 1 : 0);
    }

    query += ' ORDER BY startDate DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return db.prepare(query).all(...params) as Raffle[];
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM raffles WHERE id = ?').get(id) as Raffle | undefined;
  },

  create: (raffle: Omit<Raffle, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO raffles (id, title, description, startDate, endDate, imageUrl,
        prizeDetails, rules, active, winnerAnnounced, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      raffle.id,
      raffle.title,
      raffle.description || null,
      raffle.startDate,
      raffle.endDate,
      raffle.imageUrl || null,
      raffle.prizeDetails || null,
      raffle.rules || null,
      raffle.active,
      raffle.winnerAnnounced,
      now,
      now
    );

    return { ...raffle, createdAt: now, updatedAt: now };
  },

  update: (id: string, raffle: Partial<Omit<Raffle, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(raffle).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`UPDATE raffles SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM raffles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// ============================================================================
// RAFFLE ENTRIES
// ============================================================================

export interface RaffleEntry {
  id: string;
  raffleId: string;
  email: string;
  name?: string;
  phone?: string;
  submittedAt: string;
}

export const raffleEntriesDb = {
  getAllByRaffleId: (raffleId: string) => {
    return db.prepare('SELECT * FROM raffle_entries WHERE raffleId = ? ORDER BY submittedAt DESC')
      .all(raffleId) as RaffleEntry[];
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM raffle_entries WHERE id = ?').get(id) as RaffleEntry | undefined;
  },

  create: (entry: Omit<RaffleEntry, 'submittedAt'>) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO raffle_entries (id, raffleId, email, name, phone, submittedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        entry.id,
        entry.raffleId,
        entry.email,
        entry.name || null,
        entry.phone || null,
        now
      );
      return { ...entry, submittedAt: now };
    } catch (error: any) {
      // Handle duplicate entry (unique constraint violation)
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Email already entered for this raffle');
      }
      throw error;
    }
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM raffle_entries WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// ============================================================================
// CONTACT SUBMISSIONS
// ============================================================================

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  audienceType?: string;
  submittedAt: string;
}

export const contactDb = {
  getAll: (limit?: number, offset?: number) => {
    let query = 'SELECT * FROM contact_submissions ORDER BY submittedAt DESC';
    const params: any[] = [];

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return db.prepare(query).all(...params) as ContactSubmission[];
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(id) as ContactSubmission | undefined;
  },

  create: (submission: Omit<ContactSubmission, 'submittedAt'>) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO contact_submissions (id, name, email, message, audienceType, submittedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      submission.id,
      submission.name,
      submission.email,
      submission.message,
      submission.audienceType || null,
      now
    );

    return { ...submission, submittedAt: now };
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM contact_submissions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// ============================================================================
// SITE CONFIG
// ============================================================================

export interface SiteConfig {
  key: string;
  value: string;
  updatedAt: string;
}

export const configDb = {
  getAll: () => {
    return db.prepare('SELECT * FROM site_config').all() as SiteConfig[];
  },

  getByKey: (key: string) => {
    return db.prepare('SELECT * FROM site_config WHERE key = ?').get(key) as SiteConfig | undefined;
  },

  set: (key: string, value: string) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO site_config (key, value, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updatedAt = ?
    `);

    stmt.run(key, value, now, value, now);
    return { key, value, updatedAt: now };
  },

  delete: (key: string) => {
    const stmt = db.prepare('DELETE FROM site_config WHERE key = ?');
    const result = stmt.run(key);
    return result.changes > 0;
  }
};

// ============================================================================
// USERS (for admin authentication)
// ============================================================================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  role: string;
  passwordHash?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export const usersDb = {
  getAll: () => {
    return db.prepare('SELECT * FROM users').all() as User[];
  },

  getById: (id: string) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  getByEmail: (email: string) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },

  create: (user: Omit<User, 'createdAt' | 'lastLoginAt'>) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, displayName, photoUrl, role, passwordHash, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.email,
      user.displayName || null,
      user.photoUrl || null,
      user.role,
      user.passwordHash || null,
      now
    );

    return { ...user, createdAt: now };
  },

  updateLastLogin: (id: string) => {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE users SET lastLoginAt = ? WHERE id = ?');
    stmt.run(now, id);
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

export default db;
