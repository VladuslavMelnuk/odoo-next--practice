import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'database.json');

// Описуємо точну структуру нашої бази даних
interface DBData {
  keys: { key: string; role: string }[];
  metrics: { id: number; key: string; endpoint: string; method: string; status: number; time: string; date: string }[];
}

const defaultData: DBData = {
  keys: [
    { key: 'admin_key_999', role: 'admin' },
    { key: 'test_key_123', role: 'read-only' }
  ],
  metrics: []
};

export function getDB(): DBData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return defaultData;
  }
}

export function saveDB(data: DBData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
