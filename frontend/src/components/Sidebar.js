
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Bot,
  LogOut,
  X,
  Code,
  BarChart3,
  MessagesSquare,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "AI Chat", path: "/chat", icon: MessageSquare },
  { name: "Documents", path: "/documents", icon: FileText },
  { name: "Website Widget", path: "/widget", icon: Code },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Conversations", path: "/conversations", icon: MessagesSquare },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("bizassist_token");
    localStorage.removeItem("bizassist_user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        
className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
  open ? "translate-x-0" : "-translate-x-full"
}`}

      >
        {/* Brand */}
        <div className="mb-10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <Bot size={25} />
            </div>

            <span className="text-xl font-bold text-slate-900">
              BizAssist<span className="text-indigo-600"> AI</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="space-y-2 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
