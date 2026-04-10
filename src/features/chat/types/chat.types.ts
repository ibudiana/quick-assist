export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  agentId: string | null;
  agentName?: string;
  status: "open" | "closed";
  lastMessage: string;
  lastUpdated: number;
  agentUnreadCount: number;
  rating?: number;
  feedbackText?: string;
  feedbackTimestamp?: number;
}
