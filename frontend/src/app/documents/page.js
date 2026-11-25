
import Sidebar from "@/components/Sidebar";
import UploadPanel from "@/components/UploadPanel";

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-6xl">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Knowledge Base
            </h1>

            <p className="mt-2 text-slate-500">
              Manage the documents your AI assistant can learn from.
            </p>
          </div>

          {/* Document Upload Section */}
          <UploadPanel />

        </div>
      </main>
    </div>
  );
}
