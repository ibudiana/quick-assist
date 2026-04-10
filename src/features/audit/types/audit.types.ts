export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  performedBy: {
    uid: string;
    email: string;
    role: string;
  };
  timestamp: number;
}
