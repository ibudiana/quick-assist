export interface AgentProfile {
  id: string;
  name: string;
  email: string;
  role: "agent" | "superadmin";
  onlineStatus: boolean;
  lastSeen?: number;
}
