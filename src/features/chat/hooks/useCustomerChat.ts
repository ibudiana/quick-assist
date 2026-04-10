import { useState, useEffect } from "react";
import { db } from "@/features/core/firebase/config";
import {
  ref,
  onValue,
  update,
  onDisconnect,
  serverTimestamp,
} from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/features/core/firebase/config";
import { ChatService } from "../services/chat.service";
import { ChatMessage } from "../types/chat.types";

export function useCustomerChat() {
  // Config States
  const [chatId, setChatId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Local UI States
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hydrated DB States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatStatus, setChatStatus] = useState<string>("open");
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  useEffect(() => {
    // Rehydrate session
    const currentChatId = localStorage.getItem("currentChatId");
    if (currentChatId) {
      setChatId(currentChatId);
      setIsJoined(true);

      const currentUserId = localStorage.getItem("userId");
      if (currentUserId) {
        setUserId(currentUserId);
        const userRef = ref(db, `users/${currentUserId}`);
        update(userRef, { onlineStatus: true });
        onDisconnect(userRef).update({
          onlineStatus: false,
          lastSeen: serverTimestamp(),
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!chatId || !isJoined) return;

    // Stream Messages
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() as Record<
        string,
        Omit<ChatMessage, "text"> & { messageText: string }
      > | null;
      if (data) {
        const loadedMessages = Object.entries(data).map(
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
        );
        loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(loadedMessages);
      }
    });

    // Stream Chat Status
    const chatRef = ref(db, `chats/${chatId}`);
    const unsubscribeChat = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.status) setChatStatus(data.status);
        if (data.agentName) setAgentName(data.agentName);
      }
    });

    // Stream Agent Typing
    const typingRef = ref(db, `chats/${chatId}/typing/agent`);
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      setIsAgentTyping(Boolean(snapshot.val()));
    });

    return () => {
      unsubscribeMessages();
      unsubscribeChat();
      unsubscribeTyping();
    };
  }, [chatId, isJoined]);

  const joinChat = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      const userCred = await signInAnonymously(auth);
      const uid = userCred.user.uid;
      setUserId(uid);
      localStorage.setItem("userId", uid);

      const newChatId = await ChatService.createChatSession(uid, name, email);
      if (newChatId) {
        setChatId(newChatId);
        localStorage.setItem("currentChatId", newChatId);
        setIsJoined(true);

        const userRef = ref(db, `users/${uid}`);
        await update(userRef, { onlineStatus: true });
        onDisconnect(userRef).update({
          onlineStatus: false,
          lastSeen: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string, name: string) => {
    if (!chatId || !userId || chatStatus === "closed") return;
    try {
      await ChatService.updateTypingStatus(chatId, "customer", false);
      await ChatService.sendMessage(chatId, userId, name, text, true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const setCustomerTyping = async (isTyping: boolean) => {
    if (!chatId || chatStatus === "closed") return;
    ChatService.updateTypingStatus(chatId, "customer", isTyping);
  };

  const submitFeedback = async (rating: number, feedbackText: string) => {
    if (!chatId || rating === 0) return;
    await ChatService.submitChatFeedback(chatId, rating, feedbackText);
  };

  const resetSession = () => {
    localStorage.removeItem("currentChatId");
    setChatId(null);
    setIsJoined(false);
    setMessages([]);
    setChatStatus("open");
  };

  return {
    chatId,
    userId,
    isJoined,
    isLoading,
    messages,
    chatStatus,
    agentName,
    isAgentTyping,
    joinChat,
    sendMessage,
    setCustomerTyping,
    submitFeedback,
    resetSession,
  };
}
