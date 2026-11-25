"use client";
import {
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  X,
  MessageCircle,
} from "lucide-react";

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  mobileOpen,
  onClose,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static z-50 top-0 left-0
          h-full md:h-auto w-72
          bg-slate-950 border-r border-slate-800
          flex flex-col shrink-0
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <MessageSquare size={19} className="text-white" />
            </div>

            <div>
              <h2 className="text-white font-semibold">
                BizAssist AI
              </h2>
              <p className="text-xs text-slate-500">
                Your conversations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 text-sm font-medium transition"
          >
            <Plus size={18} />
            New conversation
          </button>
        </div>

        <div className="px-4 pb-2">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Recent conversations
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-10">
              <MessageCircle
                size={25}
                className="mx-auto mb-3 opacity-50"
              />
              No conversations yet.
            </div>
          )}

          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`
                group flex items-center gap-1 rounded-lg
                ${activeId === conversation._id
                  ? "bg-slate-800"
                  : "hover:bg-slate-900"}
              `}
            >
              <button
                onClick={() => onSelect(conversation._id)}
                className="flex-1 min-w-0 text-left px-3 py-3"
              >
                <p className="text-sm text-slate-200 truncate">
                  {conversation.title || "New Conversation"}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {new Date(
                    conversation.updatedAt
                  ).toLocaleDateString()}
                </p>
              </button>

              <div className="flex items-center pr-2 gap-1">
                <button
                  onClick={() => onRename(conversation)}
                  title="Rename conversation"
                  aria-label="Rename conversation"
                  className="p-2 text-slate-500 hover:text-blue-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                >
                  <Pencil size={15} />
                </button>

                <button
                  onClick={() => onDelete(conversation)}
                  title="Delete conversation"
                  aria-label="Delete conversation"
                  className="p-2 text-slate-500 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-500">
            BizAssist AI · Business Assistant
          </p>
        </div>
      </aside>
    </>
  );
}
