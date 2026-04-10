"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiCircle,
  FiCheckCircle,
  FiUser,
  FiSend,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";
import { useAdminChats } from "../hooks/useAdminChats";
import { useModal } from "@/features/core/components/ModalProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function AdminChatView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const { openModal } = useModal();
  const { user, userProfile } = useAuth();

  const {
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
  } = useAdminChats();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedChat?.agentId === user?.uid) {
      chatInputRef.current?.focus();
    }
  }, [selectedChat?.id, selectedChat?.agentId, user?.uid]);

  const handleResolveChat = () => {
    if (!selectedChat || selectedChat.status === "closed") return;
    openModal({
      title: "Resolve Chat",
      message: "Are you sure you want to mark this chat as resolved/closed?",
      onConfirm: async () => {
        await resolveChat();
      },
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !inputText.trim() ||
      !selectedChat ||
      !user ||
      selectedChat.status === "closed"
    )
      return;

    const textToSend = inputText;
    setInputText("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    await sendMessage(textToSend);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    setAgentTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setAgentTyping(false);
    }, 2000);
  };

  const filteredChats = chats.filter((chat) => {
    return (
      chat.id.includes(searchQuery) ||
      (chat.lastMessage &&
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.customerName &&
        chat.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.customerEmail &&
        chat.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Inbox List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800 shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            Inbox
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <FiCircle className="text-green-500 fill-current" size={10} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
              {userProfile?.role || "Agent"} Online
            </span>
          </div>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat)}
              className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 transition-colors ${
                selectedChat?.id === chat.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : "border-l-4 border-l-transparent"
              } ${chat.status === "closed" ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate flex-1 flex items-center gap-2">
                  {chat.customerName ||
                    `Customer ${chat.customerId?.substring(0, 6) || "Unknown"}`}
                  {chat.agentUnreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-in zoom-in">
                      {chat.agentUnreadCount}
                    </span>
                  )}
                  {chat.status === "closed" && (
                    <span className="text-[10px] bg-gray-200 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                      Closed
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400 shrink-0 ml-2">
                  {chat.lastUpdated
                    ? new Date(chat.lastUpdated).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {chat.lastMessage || "No messages yet"}
              </p>
            </button>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No chats found.
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shrink-0 bg-white dark:bg-gray-900 shadow-sm z-10 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-200 shrink-0">
                  <FiUser size={24} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {selectedChat.customerName ||
                      `Customer ${selectedChat.customerId?.substring(0, 6) || "Unknown"}`}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                    {selectedChat.status === "closed" ? (
                      <p className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <FiCheckCircle size={10} /> Chat Closed
                      </p>
                    ) : customerStatus ? (
                      <p className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <FiCircle className="fill-current" size={8} /> Active
                        now
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <FiCircle
                          className="fill-current text-gray-400"
                          size={8}
                        />{" "}
                        Offline
                      </p>
                    )}
                    {selectedChat.customerEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {selectedChat.customerEmail}
                      </p>
                    )}
                  </div>

                  {/* Display Rating & Feedback if Closed and Submitted */}
                  {selectedChat.status === "closed" && selectedChat.rating && (
                    <div className="flex items-center gap-2 mt-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 w-fit">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={14}
                            className={
                              star <= (selectedChat.rating || 0)
                                ? "fill-yellow-400 text-yellow-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      {selectedChat.feedbackText && (
                        <span className="text-xs text-gray-700 dark:text-gray-300 italic border-l border-yellow-200 pl-2">
                          {selectedChat.feedbackText}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Assignment & Resolution Controls */}
              <div className="flex gap-3">
                {selectedChat.status === "open" && (
                  <>
                    {!selectedChat.agentId ||
                    selectedChat.agentId !== user?.uid ? (
                      <button
                        onClick={acceptChat}
                        className="bg-white dark:bg-gray-900 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        {selectedChat.agentId
                          ? "Take Over Chat"
                          : "Accept Chat"}
                      </button>
                    ) : null}
                    <button
                      onClick={handleResolveChat}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Agent Ownership Banner */}
            {selectedChat.status === "open" &&
              selectedChat.agentId &&
              selectedChat.agentId !== user?.uid && (
                <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-2 flex items-center justify-between z-0">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    This chat is currently handled by{" "}
                    <strong>{selectedChat.agentName || "another agent"}</strong>
                  </p>
                </div>
              )}

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 flex flex-col space-y-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  No messages in this chat yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const isAgentMsg = msg.senderId !== selectedChat.customerId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[70%] ${isAgentMsg ? "self-end items-end" : "self-start items-start"}`}
                    >
                      {!isAgentMsg && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 mb-1.5 font-medium">
                          {msg.senderName || "Unknown Customer"}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-5 py-2.5 shadow-sm ${
                          isAgentMsg
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <span
                        className={`text-[10px] text-gray-400 mt-1 ${isAgentMsg ? "mr-1" : "ml-1"}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}

              {isCustomerTyping && (
                <div className="flex gap-1.5 items-center px-5 py-3 self-start text-gray-500 dark:text-gray-400 text-xs font-medium bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none shadow-sm mt-2 w-max">
                  {selectedChat.customerName?.split(" ")[0] || "Customer"} is
                  typing
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0 z-10">
              {selectedChat.status === "closed" ? (
                <div className="text-center p-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  This chat session has been closed.
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={inputText}
                    onChange={handleTyping}
                    placeholder={
                      selectedChat.agentId === user?.uid
                        ? "Type your message..."
                        : "Take over chat to reply..."
                    }
                    disabled={selectedChat.agentId !== user?.uid}
                    className={`flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500
                                ${selectedChat.agentId !== user?.uid ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}
                            `}
                  />
                  <button
                    type="submit"
                    disabled={
                      !inputText.trim() || selectedChat.agentId !== user?.uid
                    }
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
                  >
                    <FiSend size={20} />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiMessageSquare size={28} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              No chat selected
            </p>
            <p className="text-sm mt-1">
              Select a conversation from the sidebar to start responding
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
