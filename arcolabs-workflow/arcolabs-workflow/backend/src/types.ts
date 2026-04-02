export type RecordStatus = 'draft' | 'performed' | 'approved';

export interface Record {
  id: number;
  user_id: string;
  status: RecordStatus;
  title: string;
  state_code: string;
  data: string; // JSON string for SQLite storage
  created_at: string;
}

export interface AuditLog {
  id: number;
  record_id: number;
  action: 'create' | 'perform' | 'approve';
  before_json: string | null;
  after_json: string;
  user: string;
  timestamp: string;
}
