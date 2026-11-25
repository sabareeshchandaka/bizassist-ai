
"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

import {
  Search,
  RefreshCw,
  MessageSquare,
  UserRound,
  Bot,
  Clock3,
  ChevronLeft,
  ChevronRight,
  MessagesSquare,
  ArrowLeft,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const getToken = () => {
    const token = localStorage.getItem("bizassist_token");

    if (!token) {
      window.location.href = "/login";
      return null;
    }

    return token;
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) return;

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: search.trim(),
      });

      const response = await fetch(
        `${API_URL}/analytics/conversations?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load conversations"
        );
      }

      setConversations(data.conversations || []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchConversationDetail = async (id) => {
    try {
      setDetailLoading(true);
      setDetailError("");
      setSelectedConversation(null);

      const token = getToken();
      if (!token) return;

      const response = await fetch(
        `${API_URL}/analytics/conversations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load conversation"
        );
      }

      setSelectedConversation(data.conversation);
    } catch (err) {
      setDetailError(err.message || "Unable to load transcript");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const shortDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 pb-10 pt-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-indigo-600">
                <MessagesSquare size={17} />
                Customer engagement
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Conversations
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View and understand conversations between visitors and your AI assistant.
              </p>
            </div>

            <button
              onClick={fetchConversations}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Main layout */}
          <div className="grid min-h-[650px] gap-6 lg:grid-cols-5">

            {/* Conversation list */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">
                    All conversations
                  </h2>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                    {pagination.total} total
                  </span>
                </div>

                <div className="relative mt-4">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                      setSelectedConversation(null);
                    }}
                    placeholder="Search questions or messages..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="max-h-[540px] overflow-y-auto">
                {loading ? (
                  <div className="space-y-3 p-5">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="h-24 animate-pulse rounded-xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                      onClick={fetchConversations}
                      className="mt-3 text-sm font-semibold text-indigo-600"
                    >
                      Try again
                    </button>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <MessagesSquare
                      size={38}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-4 font-semibold text-slate-700">
                      No conversations found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try a different search term."
                        : "Website visitor conversations will appear here."}
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation._id}
                      onClick={() =>
                        fetchConversationDetail(conversation._id)
                      }
                      className="w-full border-b border-slate-100 p-5 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <UserRound size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              Website visitor
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {shortDate(conversation.lastMessageAt)}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {conversation.messageCount} messages
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                        {conversation.firstMessage ||
                          "No opening question available"}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                        <Clock3 size={13} />
                        Last active {formatDate(conversation.lastMessageAt)}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-100 p-4">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of{" "}
                  {Math.max(pagination.totalPages, 1)}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((old) => Math.max(1, old - 1))}
                    disabled={page <= 1 || loading}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <button
                    onClick={() =>
                      setPage((old) =>
                        Math.min(pagination.totalPages, old + 1)
                      )
                    }
                    disabled={
                      page >= pagination.totalPages || loading
                    }
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </section>

            {/* Conversation transcript */}
            <section className="flex min-h-[650px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                    <MessageSquare size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Conversation transcript
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Full visitor and AI message history
                    </p>
                  </div>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <RefreshCw
                      size={28}
                      className="mx-auto animate-spin text-indigo-500"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading conversation...
                    </p>
                  </div>
                </div>
              ) : detailError ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-sm text-red-600">{detailError}</p>
                    <button
                      onClick={() => setDetailError("")}
                      className="mt-3 text-sm font-semibold text-indigo-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : selectedConversation ? (
                <>
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Website visitor
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Started {formatDate(selectedConversation.createdAt)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                        {selectedConversation.messageCount} messages
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-5">
                    {selectedConversation.messages?.map(
                      (message, index) => {
                        const isUser = message.role === "user";

                        return (
                          <div
                            key={message._id || index}
                            className={`flex gap-3 ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isUser && (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <Bot size={19} />
                              </div>
                            )}

                            <div
                              className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                                isUser
                                  ? "rounded-br-sm bg-indigo-600 text-white"
                                  : "rounded-bl-sm border border-slate-100 bg-white text-slate-800"
                              }`}
                            >
                              <p className="mb-1 text-xs font-semibold opacity-70">
                                {isUser ? "Visitor" : "AI Assistant"}
                              </p>

                              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                {message.content}
                              </p>

                              {message.createdAt && (
                                <p className="mt-2 text-right text-[10px] opacity-60">
                                  {formatDate(message.createdAt)}
                                </p>
                              )}
                            </div>

                            {isUser && (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                <UserRound size={18} />
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-white p-4">
                    <p className="text-center text-xs text-slate-400">
                      This is a read-only conversation transcript.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-2xl bg-indigo-50 p-5 text-indigo-500">
                    <MessagesSquare size={35} />
                  </div>

                  <h3 className="mt-5 font-bold text-slate-800">
                    Select a conversation
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Choose a visitor conversation from the list to read the complete chat history.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
