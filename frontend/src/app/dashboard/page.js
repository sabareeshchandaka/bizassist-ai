"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";

import {
  MessageSquare,
  FileText,
  Bot,
  Users,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const recentChats = [
    {
      name: "John Smith",
      question: "What services do you offer?",
      time: "5 minutes ago",
      status: "Completed",
    },
    {
      name: "Sarah Johnson",
      question: "Can you explain your pricing?",
      time: "20 minutes ago",
      status: "Completed",
    },
    {
      name: "Michael Brown",
      question: "How can I contact support?",
      time: "1 hour ago",
      status: "Pending",
    },
  ];

  return (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
    />

    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-w-0 flex-1 p-5 md:p-8">
          {/* Dashboard heading */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Dashboard Overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening in your workspace.
              </p>
            </div>

            <a
              href="/chat"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Open AI Assistant
            </a>
          </div>

          {/* Statistics */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Conversations"
              value="1,284"
              description="Sample dashboard data"
              icon={MessageSquare}
            />

            <StatCard
              title="Documents"
              value="24"
              description="Sample uploaded documents"
              icon={FileText}
            />

            <StatCard
              title="AI Responses"
              value="3,842"
              description="Sample response count"
              icon={Bot}
            />

            <StatCard
              title="Customers"
              value="856"
              description="Sample customer count"
              icon={Users}
            />
          </div>

          {/* Main content */}
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {/* Recent conversations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Recent Conversations
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest customer interactions
                  </p>
                </div>

                <MessageSquare className="text-indigo-600" />
              </div>

              <div className="space-y-5">
                {recentChats.map((chat, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {chat.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {chat.question}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={13} />
                        {chat.time}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        chat.status === "Completed"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {chat.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold text-slate-900">Quick Actions</h2>

              <p className="mb-6 mt-1 text-sm text-slate-500">
                Manage your AI assistant
              </p>

              <div className="space-y-4">
                <a
                  href="/documents"
                  className="flex items-center justify-between rounded-xl bg-indigo-50 p-4 text-indigo-700 hover:bg-indigo-100"
                >
                  <div>
                    <p className="font-semibold">Upload Documents</p>
                    <p className="mt-1 text-xs">Add knowledge sources</p>
                  </div>
                  <ArrowUpRight size={20} />
                </a>

                <a
                  href="/chat"
                  className="flex items-center justify-between rounded-xl bg-purple-50 p-4 text-purple-700 hover:bg-purple-100"
                >
                  <div>
                    <p className="font-semibold">Test AI Chatbot</p>
                    <p className="mt-1 text-xs">Try your assistant</p>
                  </div>
                  <ArrowUpRight size={20} />
                </a>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Demo workspace · Statistics shown are sample data.
          </p>
        </main>
      </div>
    </div>
  );
}