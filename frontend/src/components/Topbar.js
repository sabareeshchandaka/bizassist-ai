"use client";

import { Menu, Bell, Search } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={23} />
        </button>

        <div>
          <h2 className="font-semibold text-slate-900">
            Welcome to BizAssist AI
          </h2>
          <p className="text-xs text-slate-500">
            Manage your AI workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 md:flex">
          <Search size={17} className="text-slate-400" />
          <input
            placeholder="Search..."
            className="w-32 bg-transparent text-sm outline-none"
          />
        </div>

        <button aria-label="Notifications" className="relative rounded-lg p-2 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
          B
        </div>
      </div>
    </header>
  );
}