
"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

import {
  RefreshCw,
  MessageSquare,
  MessagesSquare,
  Bot,
  Users,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  CalendarDays,
  Activity,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString("en-IN")}
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-slate-800">
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="text-sm"
          style={{ color: item.color }}
        >
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError("");

      const token = localStorage.getItem("bizassist_token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/analytics/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load analytics"
        );
      }

      setAnalytics(data.analytics);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDate = (dateString) => {
    return new Date(
      `${dateString}T00:00:00Z`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  };

  const chartData =
    analytics?.dailyStats?.map((item) => ({
      ...item,
      day: formatDate(item.date),
    })) || [];

  const totalMessages = analytics?.totalMessages || 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 min-h-screen flex-1 px-5 pb-10 pt-8 md:ml-0 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-indigo-600">
                <BarChart3 size={17} />
                Business intelligence
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Analytics Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Understand how customers interact with your AI assistant.
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh data
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">
                Unable to load analytics
              </p>
              <p className="mt-1">{error}</p>

              <button
                onClick={fetchAnalytics}
                className="mt-3 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !analytics ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          ) : analytics ? (
            <>
              {/* Metric cards */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Total Conversations"
                  value={analytics.totalConversations}
                  description="All website widget sessions"
                  icon={MessagesSquare}
                  color="bg-blue-100 text-blue-600"
                />

                <MetricCard
                  title="Visitor Messages"
                  value={analytics.totalVisitorMessages}
                  description="Questions received from visitors"
                  icon={Users}
                  color="bg-violet-100 text-violet-600"
                />

                <MetricCard
                  title="AI Responses"
                  value={analytics.totalAIResponses}
                  description="Responses generated by your AI"
                  icon={Bot}
                  color="bg-emerald-100 text-emerald-600"
                />

                <MetricCard
                  title="Last 7 Days"
                  value={analytics.weeklyConversations}
                  description="New website conversations"
                  icon={TrendingUp}
                  color="bg-orange-100 text-orange-600"
                />
              </div>

              {/* Activity section */}
              <div className="mt-8 grid gap-6 xl:grid-cols-3">

                {/* Area chart */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Conversation Activity
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Daily conversations over the last 7 days
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
                      <CalendarDays size={15} />
                      Last 7 days
                    </div>
                  </div>

                  {analytics.totalConversations === 0 ? (
                    <div className="flex h-72 flex-col items-center justify-center text-center">
                      <Activity
                        size={35}
                        className="text-slate-300"
                      />
                      <p className="mt-3 font-semibold text-slate-700">
                        No activity yet
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Your conversation trends will appear here.
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={290}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="conversationGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<ChartTooltip />} />

                        <Area
                          type="monotone"
                          dataKey="conversations"
                          name="Conversations"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fill="url(#conversationGradient)"
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Summary card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    Engagement Summary
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Overall customer activity
                  </p>

                  <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Visitor messages
                      </span>
                      <span className="font-bold text-slate-900">
                        {analytics.totalVisitorMessages}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{
                          width: `${
                            totalMessages
                              ? (analytics.totalVisitorMessages /
                                  totalMessages) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        AI responses
                      </span>
                      <span className="font-bold text-slate-900">
                        {analytics.totalAIResponses}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                          width: `${
                            totalMessages
                              ? (analytics.totalAIResponses /
                                  totalMessages) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <MessageSquare
                        size={17}
                        className="text-indigo-600"
                      />
                      Total messages
                    </div>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {analytics.totalMessages.toLocaleString("en-IN")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Across all website conversations
                    </p>
                  </div>
                </div>
              </div>

              {/* Message activity chart */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Visitor vs AI Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Compare visitor messages and AI responses each day.
                </p>

                {analytics.totalMessages === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                    No message activity available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} barGap={8}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip content={<ChartTooltip />} />

                      <Bar
                        dataKey="visitorMessages"
                        name="Visitor messages"
                        fill="#8b5cf6"
                        radius={[5, 5, 0, 0]}
                      />

                      <Bar
                        dataKey="aiResponses"
                        name="AI responses"
                        fill="#10b981"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Popular questions */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                    <HelpCircle size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Frequently Asked Opening Questions
                    </h2>
                    <p className="text-sm text-slate-500">
                      Questions visitors commonly start with
                    </p>
                  </div>
                </div>

                {analytics.popularQuestions?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.popularQuestions.map(
                      (item, index) => (
                        <div
                          key={`${item.question}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                              {index + 1}
                            </span>

                            <p className="break-words text-sm font-medium text-slate-700">
                              {item.question}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {item.count} times
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <HelpCircle
                      size={32}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      No questions have been recorded yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <p>
                  Analytics are based on website widget conversations.
                </p>

                {lastUpdated && (
                  <p>
                    Last updated: {lastUpdated.toLocaleTimeString("en-IN")}
                  </p>
                )}
              </div>
            </>
          ) : (
            !error && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <BarChart3
                  size={40}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 font-semibold text-slate-800">
                  Analytics unavailable
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Refresh the page to try again.
                </p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
