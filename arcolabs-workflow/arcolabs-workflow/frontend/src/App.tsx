import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const API_URL = 'http://localhost:4000';

interface AuditLog {
  id: number;
  action: 'create' | 'perform' | 'approve';
  before_json: any;
  after_json: any;
  user: string;
  timestamp: string;
}

interface RecordData {
  sender: string;
  details: string;
  items: string[];
  notes: string;
  priority: string;
}

interface RecordType {
  id: number;
  title: string;
  status: 'draft' | 'performed' | 'approved';
  state_code: string;
  user_id: string;
  created_at: string;
  data: RecordData;
  audit_logs: AuditLog[];
}

const STATES = ['MI', 'TX', 'NY', 'VI', 'PH', 'CA', 'FL', 'OH', 'GA', 'WA'];

const statusColors: Record<string, string> = {
  draft: 'badge-draft',
  performed: 'badge-performed',
  approved: 'badge-approved',
};

const actionIcons: Record<string, string> = {
  create: '✦',
  perform: '◈',
  approve: '✔',
};

const App = () => {
  const [recordId, setRecordId] = useState<number | null>(null);
  const [record, setRecord] = useState<RecordType | null>(null);
  const [states, setStates] = useState<string[]>(STATES);
  const [selectedState, setSelectedState] = useState('MI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [localData, setLocalData] = useState<RecordData | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const refreshData = async (id: number) => {
    try {
      const res = await axios.get(`${API_URL}/record/${id}`);
      setRecord(res.data);
      setLocalData(res.data.data);
    } catch {
      showError('Failed to fetch record data.');
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/record`, { state_code: selectedState });
      setRecordId(res.data.id);
      await refreshData(res.data.id);
    } catch {
      showError('Failed to create record.');
    } finally {
      setLoading(false);
    }
  };

  const addNewState = () => {
    const name = prompt('Enter new state code (e.g. WI):');
    if (name && name.trim()) {
      const code = name.trim().toUpperCase().slice(0, 3);
      if (!states.includes(code)) setStates(prev => [...prev, code]);
    }
  };

  const handlePerform = async () => {
    if (!recordId || !localData) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/record/${recordId}/perform`, { data: localData });
      await refreshData(recordId);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Failed to perform record.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/record/${recordId}/approve`);
      await refreshData(recordId);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Cannot approve before perform.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRecordId(null);
    setRecord(null);
    setLocalData(null);
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">A</span>
          <span className="logo-text">Arcolabs</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">⬡</span>
            <span>Workflow</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">◱</span>
            <span>Records</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">◎</span>
            <span>Audit Logs</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">JD</span>
            <span>John Doe</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-area">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {!recordId ? (
          /* ── Dashboard / Create ── */
          <div className="dashboard">
            <header className="dash-header">
              <div>
                <p className="dash-eyebrow">CMS Workflow Manager</p>
                <h1 className="dash-title">Draft State Application</h1>
              </div>
              <div className="dash-stats">
                <div className="stat-pill">
                  <span className="stat-dot draft-dot" />
                  <span>Draft</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-dot performed-dot" />
                  <span>Performed</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-dot approved-dot" />
                  <span>Approved</span>
                </div>
              </div>
            </header>

            <div className="flow-diagram">
              <div className="flow-step">
                <div className="flow-circle draft-circle">1</div>
                <span>Create Draft</span>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="flow-circle performed-circle">2</div>
                <span>Perform</span>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="flow-circle approved-circle">3</div>
                <span>Approve</span>
              </div>
            </div>

            <div className="create-card">
              <h2 className="card-title">New Record</h2>
              <p className="card-sub">Select a state code and initialise a new workflow record.</p>

              <div className="field-row">
                <label className="field-label">State / Region Code</label>
                <div className="state-row">
                  <select
                    className="state-select"
                    value={selectedState}
                    onChange={e => setSelectedState(e.target.value)}
                  >
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="add-state-btn" onClick={addNewState} title="Add state">+</button>
                </div>
              </div>

              <button
                className="cta-btn"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Creating…' : '⊕ Create Record'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Record View ── */
          <div className="record-view">
            <div className="record-topbar">
              <button className="back-btn" onClick={handleBack}>← Dashboard</button>
              <div className="record-meta">
                <span className="record-id-tag">ID #{record?.id}</span>
                <span className={`status-badge ${statusColors[record?.status ?? 'draft']}`}>
                  {record?.status?.toUpperCase()}
                </span>
              </div>
            </div>

            <h2 className="record-title">{record?.title}</h2>
            <p className="record-sub">
              State: <strong>{record?.state_code}</strong> &nbsp;|&nbsp;
              User: <strong>{record?.user_id}</strong> &nbsp;|&nbsp;
              Created: <strong>{record?.created_at ? new Date(record.created_at).toLocaleString() : '—'}</strong>
            </p>

            {/* Approved lock banner */}
            {record?.status === 'approved' && (
              <div className="lock-banner">
                🔒 This record is locked and read-only. No further changes permitted.
              </div>
            )}

            <div className="two-col">
              {/* Form card */}
              <section className="form-card">
                <h3 className="section-title">Record Details</h3>

                <div className="field-group">
                  <label className="field-label">Sender Email</label>
                  <input
                    className="field-input"
                    type="email"
                    value={localData?.sender ?? ''}
                    disabled={record?.status !== 'draft'}
                    onChange={e => setLocalData(d => d ? { ...d, sender: e.target.value } : d)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Details</label>
                  <textarea
                    className="field-textarea"
                    value={localData?.details ?? ''}
                    disabled={record?.status !== 'draft'}
                    rows={3}
                    onChange={e => setLocalData(d => d ? { ...d, details: e.target.value } : d)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Priority</label>
                  <select
                    className="field-input"
                    value={localData?.priority ?? 'medium'}
                    disabled={record?.status !== 'draft'}
                    onChange={e => setLocalData(d => d ? { ...d, priority: e.target.value } : d)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">Notes</label>
                  <textarea
                    className="field-textarea"
                    value={localData?.notes ?? ''}
                    disabled={record?.status !== 'draft'}
                    rows={2}
                    placeholder="Add any notes…"
                    onChange={e => setLocalData(d => d ? { ...d, notes: e.target.value } : d)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Items</label>
                  <div className="items-list">
                    {localData?.items?.map((item, i) => (
                      <span key={i} className="item-tag">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="action-row">
                  {record?.status === 'draft' && (
                    <button className="perform-btn" onClick={handlePerform} disabled={loading}>
                      {loading ? <span className="spinner" /> : '◈'} Perform
                    </button>
                  )}
                  {record?.status === 'performed' && (
                    <button className="approve-btn" onClick={handleApprove} disabled={loading}>
                      {loading ? <span className="spinner" /> : '✔'} Approve
                    </button>
                  )}
                </div>
              </section>

              {/* Audit log */}
              <section className="audit-card">
                <h3 className="section-title">Audit Log</h3>
                <div className="log-list">
                  {record?.audit_logs?.length === 0 && (
                    <p className="no-logs">No log entries yet.</p>
                  )}
                  {record?.audit_logs?.map(log => (
                    <div
                      key={log.id}
                      className={`log-entry ${expandedLog === log.id ? 'expanded' : ''}`}
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <div className="log-row">
                        <span className={`log-icon action-${log.action}`}>
                          {actionIcons[log.action]}
                        </span>
                        <div className="log-info">
                          <span className="log-action">{log.action.toUpperCase()}</span>
                          <span className="log-user">by {log.user}</span>
                        </div>
                        <span className="log-time">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className="log-chevron">{expandedLog === log.id ? '▲' : '▼'}</span>
                      </div>

                      {expandedLog === log.id && (
                        <div className="log-detail">
                          {log.before_json && (
                            <div className="json-block">
                              <span className="json-label">Before</span>
                              <pre>{JSON.stringify(log.before_json, null, 2)}</pre>
                            </div>
                          )}
                          <div className="json-block">
                            <span className="json-label">After</span>
                            <pre>{JSON.stringify(log.after_json, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
