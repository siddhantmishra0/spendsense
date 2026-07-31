import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIAssistant({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi there! I'm SpendSense AI. How can I help you with your finances today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare history for AI
      const messageHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      })).concat([{ role: "user", content: userMessage.content }]);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/ai/chat`,
        {
          userId,
          messages: messageHistory,
        },
        { withCredentials: true }
      );

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.reply || "I'm sorry, I didn't understand that.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Oops, something went wrong connecting to the AI. Please make sure the AI is properly configured.",
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all z-50 flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
          <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">SpendSense AI</h3>
                <p className="text-xs text-blue-100 opacity-90">Financial Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : msg.isError
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-tl-sm border border-red-200 dark:border-red-800"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-gray-700 shadow-sm"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:text-gray-800 dark:prose-pre:text-gray-200 break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2 text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 bg-gray-100 dark:bg-gray-900 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-0 text-sm rounded-xl px-4 py-2.5 dark:text-white transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
