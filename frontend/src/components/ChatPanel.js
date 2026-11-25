
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Send, Plus } from "lucide-react";

import ConversationSidebar from "./ConversationSidebar";

import {
  getConversations,
  getConversation,
  sendChatMessage,
  renameConversation,
  deleteConversation,
} from "@/services/api";

export default function ChatPanel() {
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  // Load all conversations
  const loadConversations = async () => {
    const data = await getConversations();
    setConversations(data.conversations || []);
    return data.conversations || [];
  };

  // Load conversations when the page opens
  useEffect(() => {
    const token = localStorage.getItem("bizassist_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const initializeChat = async () => {
      try {
        const items = await loadConversations();

        // Automatically open the most recently updated conversation
        if (items.length > 0) {
          await openConversation(items[0]._id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setHistoryLoading(false);
      }
    };

    initializeChat();
  }, [router]);

  // Scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Open a selected conversation
  const openConversation = async (id) => {
    if (loading) return;

    try {
      setError("");
      setHistoryLoading(true);

      const data = await getConversation(id);
      const conversation = data.conversation;

      setConversationId(conversation._id);

      setMessages(
        (conversation.messages || []).map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );

      setSidebarOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Start a new chat
  const startNewChat = () => {
    if (loading) return;

    setConversationId(null);
    setMessages([]);
    setInput("");
    setError("");
    setSidebarOpen(false);
  };

  // Send a message
  const handleSend = async (e) => {
    e.preventDefault();

    const message = input.trim();

    if (!message || loading) return;

    setError("");
    setInput("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    try {
      const data = await sendChatMessage(
        message,
        conversationId
      );

      setConversationId(data.conversationId);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);

      await loadConversations();
    } catch (err) {
      setError(err.message);

      // Remove the optimistic user message if sending failed
      setMessages((previous) => {
        const updated = [...previous];
        updated.pop();
        return updated;
      });

      setInput(message);
    } finally {
      setLoading(false);
    }
  };

  // Rename a conversation
  const handleRename = async (conversation) => {
    const newTitle = window.prompt(
      "Enter a new conversation title:",
      conversation.title
    );

    if (newTitle === null) return;

    if (!newTitle.trim()) {
      setError("Conversation title cannot be empty.");
      return;
    }

    try {
      setError("");

      await renameConversation(
        conversation._id,
        newTitle.trim()
      );

      await loadConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a conversation
  const handleDelete = async (conversation) => {
    const confirmed = window.confirm(
      `Delete "${conversation.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteConversation(conversation._id);

      if (conversationId === conversation._id) {
        setConversationId(null);
        setMessages([]);
      }

      await loadConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  if (historyLoading) {
    return (
      <div className="p-8 text-slate-400">
        Loading your conversations...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-110px)] min-h-[500px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">

      {/* Conversation sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        onSelect={openConversation}
        onNewChat={startNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat section */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-300 hover:text-white"
              aria-label="Open conversations"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-white font-semibold">
                BizAssist AI
              </h2>

              <p className="text-slate-400 text-sm">
                Your AI business assistant
              </p>
            </div>
          </div>

          <button
            onClick={startNewChat}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {messages.length === 0 && (
            <div className="text-center mt-20 px-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/20 flex items-center justify-center">
                <Send size={25} className="text-blue-400" />
              </div>

              <h3 className="text-2xl text-white font-semibold mt-5">
                How can I help your business?
              </h3>

              <p className="text-slate-400 mt-3">
                Ask questions about your business, documents,
                customers, services, or operations.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-xl whitespace-pre-wrap break-words ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-300 rounded-xl p-4 text-sm">
                BizAssist AI is thinking...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-slate-800 flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask BizAssist AI something..."
            disabled={loading}
            maxLength={4000}
            className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 rounded-lg"
          >
            <Send size={19} />
          </button>
        </form>

      </div>
    </div>
  );
}
