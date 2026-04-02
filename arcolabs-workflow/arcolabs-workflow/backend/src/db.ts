import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export async function initDB(): Promise<Database> {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      status TEXT,
      title TEXT,
      state_code TEXT,
      data TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER,
      action TEXT,
      before_json TEXT,
      after_json TEXT,
      user TEXT,
      timestamp TEXT,
      FOREIGN KEY(record_id) REFERENCES records(id)
    );
  `);

  return db;
}
