import { openDB, DBSchema } from 'idb';

interface LogicLooperDB extends DBSchema {
  activity: {
    key: string; // "YYYY-MM-DD"
    value: {
      date: string;
      score: number;
      timeTaken: number;
      difficulty: string;
      synced: boolean;
    };
  };
}

const DB_NAME = 'logic-looper-v1';

export async function initDB() {
  return openDB<LogicLooperDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('activity')) {
        db.createObjectStore('activity', { keyPath: 'date' });
      }
    },
  });
}

export async function saveActivity(date: string, score: number, timeTaken: number, difficulty: string) {
  const db = await initDB();
  await db.put('activity', {
    date,
    score,
    timeTaken,
    difficulty,
    synced: false, // Mark as dirty/unsynced
  });
}

export async function getUnsyncedActivities() {
  const db = await initDB();
  const all = await db.getAll('activity');
  return all.filter((entry) => !entry.synced);
}

export async function markAsSynced(dates: string[]) {
  const db = await initDB();
  const tx = db.transaction('activity', 'readwrite');
  const store = tx.objectStore('activity');
  
  for (const date of dates) {
    const entry = await store.get(date);
    if (entry) {
      entry.synced = true;
      await store.put(entry);
    }
  }
  await tx.done;
}

export async function getAllActivity() {
  const db = await initDB();
  return db.getAll('activity');
}