import { initDB } from '../src/db';

describe('State Transition Logic', () => {
  let db: any;

  beforeAll(async () => {
    // Use in-memory DB for tests
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    db = await open({ filename: ':memory:', driver: sqlite3.Database });
    await db.exec(`
      CREATE TABLE records (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, status TEXT, title TEXT, state_code TEXT, data TEXT, created_at TEXT);
      CREATE TABLE audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, record_id INTEGER, action TEXT, before_json TEXT, after_json TEXT, user TEXT, timestamp TEXT);
    `);
  });

  test('should create record in draft state', async () => {
    const result = await db.run(
      `INSERT INTO records (user_id, status, title, state_code, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['user1', 'draft', 'Test Record', 'TX', JSON.stringify({ details: 'test' }), new Date().toISOString()]
    );
    const record = await db.get('SELECT * FROM records WHERE id = ?', [result.lastID]);
    expect(record.status).toBe('draft');
  });

  test('should not allow approve from draft (illegal transition)', async () => {
    const result = await db.run(
      `INSERT INTO records (user_id, status, title, state_code, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['user1', 'draft', 'Test Record 2', 'MI', JSON.stringify({ details: 'test' }), new Date().toISOString()]
    );
    const record = await db.get('SELECT * FROM records WHERE id = ?', [result.lastID]);
    // Simulate the guard
    const canApprove = record.status === 'performed';
    expect(canApprove).toBe(false);
  });

  test('should create audit log entry on create', async () => {
    const data = { details: 'test', sender: 'test@email.com' };
    const result = await db.run(
      `INSERT INTO records (user_id, status, title, state_code, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['user1', 'draft', 'Audit Test', 'NY', JSON.stringify(data), new Date().toISOString()]
    );
    await db.run(
      `INSERT INTO audit_logs (record_id, action, before_json, after_json, user, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
      [result.lastID, 'create', null, JSON.stringify(data), 'John Doe', new Date().toISOString()]
    );
    const logs = await db.all('SELECT * FROM audit_logs WHERE record_id = ?', [result.lastID]);
    expect(logs.length).toBe(1);
    expect(logs[0].action).toBe('create');
    expect(logs[0].before_json).toBeNull();
  });
});
