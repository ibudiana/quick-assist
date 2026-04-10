import { db } from "@/features/core/firebase/config";
import {
  ref,
  set,
  push,
  update,
  serverTimestamp,
  increment,
} from "firebase/database";

export const ChatService = {
  async createChatSession(
    customerId: string,
    customerName: string,
    customerEmail: string,
  ) {
    const chatRef = push(ref(db, "chats"));
    await set(chatRef, {
      customerId,
      customerName: customerName || "Guest",
      customerEmail: customerEmail || "",
      agentId: null, // Unassigned
      status: "open",
      lastMessage: "",
      lastUpdated: serverTimestamp(),
      agentUnreadCount: 0,
    });

    // Create user profile in parallel
    const userRef = ref(db, `users/${customerId}`);
    await update(userRef, {
      name: customerName || "Guest",
      email: customerEmail || "",
      role: "customer",
      lastSeen: serverTimestamp(),
    });

    // Automatically opt-in to CRM list if an email is provided
    if (customerEmail && customerEmail.trim() !== "") {
      const safeEmailKey = customerEmail.replace(/[.#$[\]]/g, "_"); // Firebase keys cannot contain certain characters
      const subRef = ref(db, `subscribers/${safeEmailKey}`);
      await update(subRef, {
        name: customerName || "Guest",
        email: customerEmail,
        customerId: customerId,
        subscribedAt: serverTimestamp(),
      });
    }

    return chatRef.key;
  },

  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    text: string,
    isCustomer = false,
  ) {
    const messagesRef = push(ref(db, `chats/${chatId}/messages`));
    await set(messagesRef, {
      senderId,
      senderName,
      messageText: text,
      timestamp: serverTimestamp(),
      readBy: [senderId],
    });

    // Update chat metadata
    const chatUpdates: {
      lastMessage: string;
      lastUpdated: object;
      agentUnreadCount?: object;
    } = {
      lastMessage: text,
      lastUpdated: serverTimestamp(),
    };

    if (isCustomer) {
      chatUpdates.agentUnreadCount = increment(1);
    }

    const chatRef = ref(db, `chats/${chatId}`);
    await update(chatRef, chatUpdates);
  },

  async submitChatFeedback(
    chatId: string,
    rating: number,
    feedbackText: string,
  ) {
    try {
      const chatRef = ref(db, `chats/${chatId}`);
      await update(chatRef, {
        rating,
        feedbackText,
        feedbackTimestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      throw err;
    }
  },

  async updateTypingStatus(
    chatId: string,
    role: "agent" | "customer",
    isTyping: boolean,
  ) {
    await update(ref(db), { [`chats/${chatId}/typing/${role}`]: isTyping });
  },

  async markAsRead(chatId: string) {
    await update(ref(db, `chats/${chatId}`), { agentUnreadCount: 0 });
  },

  async assignAgent(chatId: string, agentId: string, agentName: string) {
    const chatRef = ref(db, `chats/${chatId}`);
    await update(chatRef, {
      agentId,
      agentName,
      agentUnreadCount: 0,
    });
  },

  async resolveChat(chatId: string) {
    const chatRef = ref(db, `chats/${chatId}`);
    await update(chatRef, {
      status: "closed",
      lastUpdated: serverTimestamp(),
    });
  },
};
