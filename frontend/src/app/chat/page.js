
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-6">
        <ChatPanel />
      </main>
    </div>
  );
}
