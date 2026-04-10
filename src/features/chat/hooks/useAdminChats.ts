import { useState, useEffect } from "react";
import { db } from "@/features/core/firebase/config";
import { ref, onValue } from "firebase/database";
import { ChatService } from "../services/chat.service";
import { ChatSession, ChatMessage } from "../types/chat.types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuditService } from "@/features/audit/services/audit.service";

export function useAdminChats() {
  const { user, userProfile } = useAuth();

  // Chats list
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  // Selected Chat Data
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customerStatus, setCustomerStatus] = useState<string | null>(null);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);

  // Fetch all chats
  useEffect(() => {
    if (!user) return;
    const chatsRef = ref(db, "chats");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val() as Record<
        string,
        Omit<ChatSession, "id">
      > | null;

      if (data) {
        const chatList = Object.entries(data).map(
          ([key, val]: [string, Omit<ChatSession, "id">]) => ({
            id: key,
            ...val,
          }),
        ) as ChatSession[];
        chatList.sort((a, b) => b.lastUpdated - a.lastUpdated);
        setChats(chatList);

        // Update selected chat reference to solve stale closure
        setSelectedChat((prev) => {
          if (prev) {
            return chatList.find((c) => c.id === prev.id) || prev;
          }
          return prev;
        });
      } else {
        setChats([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Handle selected chat side-effects

  useEffect(() => {
    if (!selectedChat) {
      // setMessages([]);
      // setCustomerStatus(null);
      // setIsCustomerTyping(false);
      return;
    }

    // Auto-read
    const activeChat = chats.find((c) => c.id === selectedChat.id);
    if (activeChat && activeChat.agentUnreadCount > 0) {
      ChatService.markAsRead(selectedChat.id).catch((err) =>
        console.error("Error auto-reading chat:", err),
      );
    }

    // Messages
    const messagesRef = ref(db, `chats/${selectedChat.id}/messages`);

    const unsubMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() as Record<
        string,
        Omit<ChatMessage, "text"> & { messageText: string }
      > | null;

      // if (!data) {
      //   setMessages([]);
      //   return;
      // }

      if (data) {
        const msgList = Object.entries(data).map(
          ([key, val]: [
            string,
            Omit<ChatMessage, "text"> & { messageText: string },
          ]) => ({
            id: key,
            text: val.messageText,
            senderId: val.senderId,
            senderName: val.senderName,
            timestamp: val.timestamp,
          }),
        ) as ChatMessage[];
        msgList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });

    // Typing Status
    const typingRef = ref(db, `chats/${selectedChat.id}/typing/customer`);
    const unsubTyping = onValue(typingRef, (snapshot) => {
      setIsCustomerTyping(Boolean(snapshot.val()));
    });

    // Customer Status
    const userRef = ref(db, `users/${selectedChat.customerId}`);
    const unsubCustomer = onValue(userRef, (snapshot) => {
      setCustomerStatus(snapshot.val());
    });

    return () => {
      unsubMessages();
      unsubTyping();
      unsubCustomer();
    };
  }, [chats, selectedChat, selectedChat?.id]);

  const selectChat = async (chat: ChatSession) => {
    setSelectedChat(chat);
    if (chat.agentUnreadCount > 0) {
      await ChatService.markAsRead(chat.id);
    }
  };

  const acceptChat = async () => {
    if (!selectedChat || !user || !userProfile) return;
    await ChatService.assignAgent(
      selectedChat.id,
      user.uid,
      userProfile.name || user.email || "Agent",
    );

    const auditUser = {
      uid: user.uid,
      email: user.email ?? "",
      role: userProfile.role,
    };

    await AuditService.logAuditEvent(
      "CHAT_TAKEN_OVER",
      `Agent took over chat ${selectedChat.id}`,
      auditUser,
    );
  };

  const resolveChat = async () => {
    if (
      !selectedChat ||
      !user ||
      !userProfile ||
      selectedChat.status === "closed"
    )
      return;
    await ChatService.resolveChat(selectedChat.id);

    const auditUser = {
      uid: user.uid,
      email: user.email ?? "",
      role: userProfile.role,
    };

    await AuditService.logAuditEvent(
      "CHAT_RESOLVED",
      `Agent resolved chat ${selectedChat.id}`,
      auditUser,
    );
    setSelectedChat(null);
  };

  const sendMessage = async (text: string) => {
    if (
      !selectedChat ||
      !user ||
      !userProfile ||
      selectedChat.status === "closed"
    )
      return;
    await ChatService.updateTypingStatus(selectedChat.id, "agent", false);
    await ChatService.sendMessage(
      selectedChat.id,
      user.uid,
      userProfile?.name || user.email || "Agent",
      text,
      false,
    );

    const auditUser = {
      uid: user.uid,
      email: user.email ?? "",
      role: userProfile.role,
    };

    await AuditService.logAuditEvent(
      "CHAT_REPLIED",
      `Agent sent a message to chat ${selectedChat.id}`,
      auditUser,
    );
  };

  const setAgentTyping = async (isTyping: boolean) => {
    if (!selectedChat || selectedChat.status === "closed") return;
    await ChatService.updateTypingStatus(selectedChat.id, "agent", isTyping);
  };

  return {
    chats,
    selectedChat,
    messages,
    customerStatus,
    isCustomerTyping,
    selectChat,
    acceptChat,
    resolveChat,
    sendMessage,
    setAgentTyping,
  };
}
