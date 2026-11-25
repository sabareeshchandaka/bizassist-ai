
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  getWidgetConfig,
  updateWidgetConfig,
} from "@/services/api";

import {
  Bot,
  Save,
  Copy,
  Check,
  Palette,
  Globe,
  Code,
  MessageSquare,
  Power,
  Loader2,
  RefreshCw,
} from "lucide-react";

const DEFAULT_CONFIG = {
  assistantName: "AI Assistant",
  welcomeMessage: "Hello! How can I help you today?",
  primaryColor: "#4F46E5",
  enabled: true,
  allowedDomains: [],
};

export default function WidgetSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [widgetId, setWidgetId] = useState("");

  const [domainsText, setDomainsText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API URL used by the installed widget.
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api"
  ).replace(/\/+$/, "");

  // Load existing widget configuration.
  const loadConfig = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWidgetConfig();

      const savedConfig = data.config;

      setConfig({
        assistantName:
          savedConfig.assistantName || DEFAULT_CONFIG.assistantName,

        welcomeMessage:
          savedConfig.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,

        primaryColor:
          savedConfig.primaryColor || DEFAULT_CONFIG.primaryColor,

        enabled: savedConfig.enabled ?? true,

        allowedDomains: savedConfig.allowedDomains || [],
      });

      setWidgetId(savedConfig.widgetId);

      setDomainsText(
        (savedConfig.allowedDomains || []).join("\n")
      );
    } catch (err) {
      setError(err.message || "Unable to load widget settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("bizassist_token")) {
      window.location.href = "/login";
      return;
    }

    loadConfig();
  }, []);

  const handleChange = (field, value) => {
    setConfig((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSuccess("");
  };

  // Save configuration to backend.
  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const allowedDomains = [
        ...new Set(
          domainsText
            .split(/[\n,]+/)
            .map((domain) => domain.trim().toLowerCase())
            .filter(Boolean)
        ),
      ];

      const updatedConfig = {
        ...config,
        allowedDomains,
      };

      const data = await updateWidgetConfig(updatedConfig);

      setConfig({
        ...updatedConfig,
        allowedDomains: data.config.allowedDomains || [],
      });

      setDomainsText(
        (data.config.allowedDomains || []).join("\n")
      );

      setSuccess("Widget settings saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save widget settings.");
    } finally {
      setSaving(false);
    }
  };

  // Generate installation code.
  const embedCode = widgetId
    ? `<script
  src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget/widget.js"
  data-widget-id="${widgetId}"
  data-api-url="${apiUrl}">
</script>`
    : "";

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);

      setTimeout(() => setEmbedCopied(false), 2000);
    } catch {
      setError("Unable to copy installation code.");
    }
  };

  const copyWidgetId = async () => {
    try {
      await navigator.clipboard.writeText(widgetId);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy widget ID.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mb-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              ☰
            </button>

            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
              Chat Widget Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Customize and install your business AI assistant.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Widget ready
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">

          {/* Alerts */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {/* Main Settings */}
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

              {/* Left settings column */}
              <div className="space-y-6 xl:col-span-2">

                {/* Appearance */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-3">
                      <Palette className="text-indigo-600" size={22} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Appearance
                      </h2>
                      <p className="text-sm text-slate-500">
                        Customize how your assistant looks.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Assistant Name
                      </label>

                      <input
                        type="text"
                        value={config.assistantName}
                        onChange={(e) =>
                          handleChange("assistantName", e.target.value)
                        }
                        maxLength={60}
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        placeholder="Example: Bright Digital Assistant"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Welcome Message
                      </label>

                      <textarea
                        rows={3}
                        value={config.welcomeMessage}
                        onChange={(e) =>
                          handleChange("welcomeMessage", e.target.value)
                        }
                        maxLength={300}
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        placeholder="Hello! How can I help you today?"
                      />

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {config.welcomeMessage.length}/300
                      </p>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-medium text-slate-700">
                        Primary Color
                      </label>

                      <div className="flex flex-wrap items-center gap-4">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) =>
                            handleChange("primaryColor", e.target.value)
                          }
                          className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                        />

                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) =>
                            handleChange("primaryColor", e.target.value)
                          }
                          pattern="^#[0-9A-Fa-f]{6}$"
                          className="w-36 rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-indigo-500"
                        />

                        <div
                          className="h-10 w-10 rounded-full shadow-sm"
                          style={{
                            backgroundColor: config.primaryColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Widget Status */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <Power className="text-emerald-600" size={22} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Widget Status
                        </h2>
                        <p className="text-sm text-slate-500">
                          Control whether visitors can use your chatbot.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={config.enabled}
                      onClick={() =>
                        handleChange("enabled", !config.enabled)
                      }
                      className={`relative h-7 w-12 rounded-full transition ${
                        config.enabled
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                          config.enabled
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <p className={`mt-4 text-sm font-medium ${
                    config.enabled
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}>
                    {config.enabled
                      ? "Your chatbot is enabled."
                      : "Your chatbot is currently disabled."}
                  </p>
                </section>

                {/* Allowed Domains */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <Globe className="text-blue-600" size={22} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Authorized Websites
                      </h2>
                      <p className="text-sm text-slate-500">
                        Choose which websites can use this widget.
                      </p>
                    </div>
                  </div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Website Domains
                  </label>

                  <textarea
                    rows={4}
                    value={domainsText}
                    onChange={(e) => setDomainsText(e.target.value)}
                    placeholder={"example.com\nwww.example.com"}
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Enter one domain per line. Do not include paths.
                    Example: example.com
                  </p>
                </section>

                {/* Save */}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={19} />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={19} />
                      Save Widget Settings
                    </>
                  )}
                </button>
              </div>

              {/* Right preview column */}
              <div className="space-y-6">

                {/* Preview */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h2 className="font-semibold text-slate-900">
                      Live Preview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      See your current widget appearance.
                    </p>
                  </div>

                  <div className="flex min-h-[390px] items-end justify-center bg-slate-100 p-5">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
                      <div
                        className="flex items-center gap-3 p-4 text-white"
                        style={{
                          backgroundColor: config.primaryColor,
                        }}
                      >
                        <div className="rounded-full bg-white/20 p-2">
                          <Bot size={23} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {config.assistantName || "AI Assistant"}
                          </p>
                          <p className="text-xs text-white/80">
                            Online · Powered by BizAssist
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 bg-slate-50 p-4">
                        <div className="flex items-start gap-2">
                          <div className="rounded-xl bg-slate-200 p-3 text-sm text-slate-800">
                            {config.welcomeMessage || "Welcome!"}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div
                            className="rounded-xl px-3 py-2 text-sm text-white"
                            style={{
                              backgroundColor: config.primaryColor,
                            }}
                          >
                            How can you help me?
                          </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
                          <span className="flex-1 text-xs text-slate-400">
                            Type your message...
                          </span>
                          <MessageSquare
                            size={17}
                            style={{ color: config.primaryColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Widget ID */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Code size={19} className="text-indigo-600" />
                    <h2 className="font-semibold text-slate-900">
                      Widget ID
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
                      {widgetId}
                    </code>

                    <button
                      type="button"
                      onClick={copyWidgetId}
                      className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                      title="Copy widget ID"
                    >
                      {copied ? (
                        <Check size={17} className="text-emerald-600" />
                      ) : (
                        <Copy size={17} />
                      )}
                    </button>
                  </div>
                </section>

                {/* Installation Code */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Code size={19} className="text-indigo-600" />
                    <h2 className="font-semibold text-slate-900">
                      Installation Code
                    </h2>
                  </div>

                  <p className="mb-3 text-sm text-slate-500">
                    Copy this script and paste it before the closing
                    body tag of your website.
                  </p>

                  <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">
                    <code>{embedCode}</code>
                  </pre>

                  <button
                    type="button"
                    onClick={copyEmbedCode}
                    disabled={!widgetId}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {embedCopied ? (
                      <>
                        <Check size={17} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={17} />
                        Copy Installation Code
                      </>
                    )}
                  </button>
                </section>

                <button
                  type="button"
                  onClick={loadConfig}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Reload Settings
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Installation tip:</strong> Save your settings first.
            Add your website's domain to the authorized list, then copy
            the installation code and paste it into your website.
          </div>
        </div>
      </main>
    </div>
  );
}
