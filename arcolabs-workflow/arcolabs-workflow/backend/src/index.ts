import express from 'express';
import cors from 'cors';
import { initDB } from './db';

const app = express();
app.use(cors());
app.use(express.json());

const DUMMY_USER = 'John Doe';

async function startServer() {
  const db = await initDB();

  // GET /record/:id — Returns record + audit log
  app.get('/record/:id', async (req, res) => {
    const record = await db.get('SELECT * FROM records WHERE id = ?', [req.params.id]);
    if (!record) return res.status(404).json({ error: 'Not found' });

    const logs = await db.all(
      'SELECT * FROM audit_logs WHERE record_id = ? ORDER BY id DESC',
      [req.params.id]
    );

    res.json({
      ...record,
      data: JSON.parse(record.data),
      audit_logs: logs.map((log: any) => ({
        ...log,
        before_json: log.before_json ? JSON.parse(log.before_json) : null,
        after_json: log.after_json ? JSON.parse(log.after_json) : null,
      }))
    });
  });

  // POST /record — Create a new record in draft state
  app.post('/record', async (req, res) => {
    const { state_code } = req.body;

    const initialData = {
      sender: 'user@rocketmail.com',
      details: 'This page shows the Client details registered with CMS',
      items: ['item1', 'item2'],
      notes: '',
      priority: 'medium'
    };

    const result = await db.run(
      `INSERT INTO records (user_id, status, title, state_code, data, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'temp_001',
        'draft',
        `New Proposal - Draft (${state_code})`,
        state_code,
        JSON.stringify(initialData),
        new Date().toISOString()
      ]
    );

    await db.run(
      `INSERT INTO audit_logs (record_id, action, before_json, after_json, user, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [result.lastID, 'create', null, JSON.stringify(initialData), DUMMY_USER, new Date().toISOString()]
    );

    res.status(201).json({ id: result.lastID });
  });

  // POST /record/:id/perform — Save form data and move to performed
  app.post('/record/:id/perform', async (req, res) => {
    const record = await db.get('SELECT * FROM records WHERE id = ?', [req.params.id]);
    if (!record || record.status !== 'draft') {
      return res.status(400).json({ error: 'Illegal transition: record must be in draft state' });
    }

    const updatedData = req.body.data;

    await db.run(
      'UPDATE records SET status = "performed", data = ? WHERE id = ?',
      [JSON.stringify(updatedData), req.params.id]
    );

    await db.run(
      `INSERT INTO audit_logs (record_id, action, before_json, after_json, user, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, 'perform', record.data, JSON.stringify(updatedData), DUMMY_USER, new Date().toISOString()]
    );

    res.json({ message: 'Status updated to performed' });
  });

  // POST /record/:id/approve — Move to approved and lock
  app.post('/record/:id/approve', async (req, res) => {
    const record = await db.get('SELECT * FROM records WHERE id = ?', [req.params.id]);
    if (!record || record.status !== 'performed') {
      return res.status(400).json({ error: 'Cannot approve before perform: record must be in performed state' });
    }

    await db.run('UPDATE records SET status = "approved" WHERE id = ?', [req.params.id]);

    await db.run(
      `INSERT INTO audit_logs (record_id, action, before_json, after_json, user, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, 'approve', record.data, record.data, DUMMY_USER, new Date().toISOString()]
    );

    res.json({ message: 'Record approved and locked' });
  });

  app.listen(4000, () => console.log('Server running on http://localhost:4000'));
}

startServer();
