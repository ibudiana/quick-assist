"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiUser,
  FiMail,
  FiStar,
} from "react-icons/fi";
import { useCustomerChat } from "../hooks/useCustomerChat";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inputText, setInputText] = useState("");

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useCustomerChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleJoinChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    await joinChat(name, email);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText(""); // Optimistic clear

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    await sendMessage(textToSend, name);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    setCustomerTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setCustomerTyping(false);
    }, 2000);
  };

  const startNewChat = () => {
    resetSession();
    setRating(0);
    setFeedbackText("");
    setIsFeedbackSubmitted(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(rating, feedbackText);
    setIsFeedbackSubmitted(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-125 border border-gray-100 dark:border-gray-700 transition-all duration-300">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-semibold text-lg">Quick Assist</h3>
              <p className="text-blue-100 text-sm">
                We typically reply in minutes
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {!isJoined ? (
            /* Pre-Chat Form */
            <div className="flex-1 flex flex-col p-6 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Please tell us a bit about yourself before we start chatting.
                </p>
              </div>
              <form onSubmit={handleJoinChat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FiUser />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FiMail />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Joining..." : "Start Chat"}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 flex flex-col space-y-3">
                {agentName && chatStatus === "open" && (
                  <div className="flex justify-center my-2">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 text-center shadow-sm">
                      Agent {agentName} has joined the chat and will be
                      assisting you
                    </span>
                  </div>
                )}
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <FiMessageSquare size={28} className="text-blue-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                      You are now connected. Say hi!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}
                      >
                        {!isMe && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-2 mb-1 font-medium">
                            {msg.senderName || "Support Agent"}
                          </span>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                              : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                {isAgentTyping && (
                  <div className="flex gap-1.5 items-center px-4 py-2.5 self-start text-gray-500 dark:text-gray-400 text-xs font-medium bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none shadow-sm mt-3 w-max">
                    Agent is typing
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area / Resolution State */}
              <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 shrink-0">
                {chatStatus === "closed" ? (
                  <div className="flex flex-col items-center justify-center p-3 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    {!isFeedbackSubmitted ? (
                      <form
                        onSubmit={handleFeedbackSubmit}
                        className="w-full flex flex-col items-center"
                      >
                        <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold mb-2">
                          How was your support experience?
                        </p>
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="focus:outline-none transition-transform hover:scale-110"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(star)}
                            >
                              <FiStar
                                size={24}
                                className={`${(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-500" : "text-gray-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Leave a comment (optional)..."
                          className="w-full h-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3"
                        />
                        <button
                          type="submit"
                          disabled={rating === 0}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Submit Feedback
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                          <FiStar size={24} className="fill-current" />
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold mb-1">
                          Thank you for your feedback!
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                          Your chat has been successfully resolved.
                        </p>
                        <button
                          onClick={startNewChat}
                          className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          Start a New Chat
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="flex items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleTyping}
                      placeholder="Type your message..."
                      className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="ml-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiSend size={18} />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 flex items-center justify-center"
        >
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
