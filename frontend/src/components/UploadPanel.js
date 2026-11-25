
"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  FileUp,
  Trash2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "@/services/api";

export default function UploadPanel() {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDocuments = async () => {
    try {
      setError("");

      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Please select a PDF, DOCX or TXT file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const result = await uploadDocument(file);

      setSuccess(result.message);
      await loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const result = await deleteDocument(id);

      setDocuments((current) =>
        current.filter((document) => document._id !== id)
      );

      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Business Knowledge Base
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload your business documents so BizAssist can
            use their information when answering questions.
          </p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-500 hover:bg-blue-50"
        >
          {uploading ? (
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          ) : (
            <FileUp className="mx-auto h-10 w-10 text-blue-600" />
          )}

          <h3 className="mt-4 font-semibold text-slate-800">
            {uploading
              ? "Processing your document..."
              : "Click to upload a document"}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            PDF, DOCX and TXT · Maximum size 5 MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Uploaded Documents
            </h2>

            <p className="text-sm text-slate-500">
              {documents.length} document(s) in your workspace
            </p>
          </div>

          <button
            onClick={loadDocuments}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            title="Refresh documents"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-500">
            Loading documents...
          </p>
        ) : documents.length === 0 ? (
          <div className="py-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              No documents uploaded yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Upload your first business document above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((document) => (
              <div
                key={document._id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <FileText className="text-blue-600" size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {document.originalName}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(document.size / 1024).toFixed(1)} KB ·{" "}
                      {new Date(document.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Processed
                  </span>

                  <button
                    onClick={() => handleDelete(document._id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete document"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
