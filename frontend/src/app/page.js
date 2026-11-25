
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  FileText,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  Check,
  Sparkles,
  Menu,
  Database,
  Users,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Intelligent Conversations",
    description:
      "Give your customers instant, helpful answers with an AI assistant that understands their questions.",
  },
  {
    icon: FileText,
    title: "Business Knowledge Base",
    description:
      "Upload your business documents and let your assistant learn from your products, policies and services.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Workspaces",
    description:
      "Keep your business information organized with dedicated workspaces and protected access.",
  },
  {
    icon: BarChart3,
    title: "Conversation Insights",
    description:
      "Understand customer questions and discover opportunities to improve your business.",
  },
  {
    icon: Globe,
    title: "Works Across Industries",
    description:
      "Build assistants for education, retail, hospitality, technology and many other industries.",
  },
  {
    icon: Zap,
    title: "Always Available",
    description:
      "Help customers get answers whenever they need them, without waiting for business hours.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your workspace",
    description:
      "Register your business and set up your own AI assistant workspace.",
  },
  {
    number: "02",
    title: "Add your knowledge",
    description:
      "Upload business documents, product information and frequently asked questions.",
  },
  {
    number: "03",
    title: "Start assisting customers",
    description:
      "Let your AI assistant answer questions using your business knowledge.",
  },
];

const benefits = [
  "Dedicated business workspace",
  "AI-powered conversations",
  "Business document knowledge base",
  "Conversation history",
  "Easy website integration (coming soon)",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080D1A] text-white">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080D1A]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Bot size={24} />
            </div>

            <span className="text-xl font-bold tracking-tight">
              BizAssist<span className="text-blue-400"> AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
            <a href="#about" className="hover:text-white">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pb-24 pt-24 md:pb-32 md:pt-32">

        <div className="absolute left-1/2 top-0 -z-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-7xl">

          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              <Sparkles size={16} />
              <span>One AI assistant. Every business.</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Your business.
              <br />
              Your knowledge.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                One intelligent assistant.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
              Meet BizAssist AI — a universal AI business assistant
              that helps companies answer customer questions,
              manage knowledge and deliver better experiences.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-500 sm:w-auto"
              >
                Start Building Free
                <ArrowRight size={19} />
              </Link>

              <Link
                href="/login"
                className="w-full rounded-xl border border-white/15 px-7 py-4 text-center font-semibold text-slate-200 transition hover:bg-white/5 sm:w-auto"
              >
                Explore Workspace
              </Link>

            </div>

            <p className="mt-5 text-sm text-slate-500">
              Designed for businesses of every size.
            </p>

          </div>

          {/* DASHBOARD PREVIEW */}
          <div className="mx-auto mt-20 max-w-5xl">

            <div className="rounded-2xl border border-white/10 bg-[#10192B] p-3 shadow-2xl shadow-blue-950/40">

              <div className="flex items-center justify-between border-b border-white/10 px-4 pb-4 pt-2">

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>

                <div className="text-xs text-slate-500">
                  BizAssist AI Workspace
                </div>

                <div className="h-3 w-3 rounded-full bg-blue-400" />

              </div>

              <div className="grid gap-4 p-4 md:grid-cols-[200px_1fr] md:p-6">

                {/* SIDEBAR PREVIEW */}
                <div className="hidden space-y-4 border-r border-white/10 pr-5 md:block">

                  <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-3 text-sm text-blue-300">
                    <BarChart3 size={17} />
                    Dashboard
                  </div>

                  <div className="flex items-center gap-2 p-3 text-sm text-slate-400">
                    <MessageSquare size={17} />
                    Conversations
                  </div>

                  <div className="flex items-center gap-2 p-3 text-sm text-slate-400">
                    <Database size={17} />
                    Knowledge Base
                  </div>

                  <div className="flex items-center gap-2 p-3 text-sm text-slate-400">
                    <Users size={17} />
                    Customers
                  </div>

                </div>

                {/* DASHBOARD CONTENT */}
                <div className="space-y-5">

                  <div>
                    <p className="text-sm text-slate-400">
                      Welcome to your workspace
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      Business Overview
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">

                    {[
                      ["Conversations", "1,284"],
                      ["Knowledge Files", "24"],
                      ["AI Responses", "3,842"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/10 bg-[#172237] p-4"
                      >
                        <p className="text-xs text-slate-400">
                          {label}
                        </p>
                        <p className="mt-3 text-2xl font-bold">
                          {value}
                        </p>
                        <p className="mt-1 text-xs text-emerald-400">
                          Sample data
                        </p>
                      </div>
                    ))}

                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#172237] p-5">

                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                        <Bot size={22} />
                      </div>

                      <div>
                        <p className="font-semibold">
                          BizAssist AI
                        </p>
                        <p className="text-xs text-emerald-400">
                          Assistant preview
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">

                      <div className="max-w-[85%] rounded-xl bg-[#26344B] p-3 text-sm text-slate-200">
                        Hello! Welcome to your business assistant.
                        How can I help you today?
                      </div>

                      <div className="ml-auto max-w-[85%] rounded-xl bg-blue-600 p-3 text-sm">
                        Can you help me answer customer questions?
                      </div>

                      <div className="max-w-[85%] rounded-xl bg-[#26344B] p-3 text-sm text-slate-200">
                        Absolutely! I can help customers using your
                        business information and knowledge base.
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Illustrative dashboard preview — displayed figures are sample data.
            </p>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-white/10 bg-[#0B1221] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold uppercase tracking-widest text-blue-400">
              Powerful capabilities
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Everything your business needs
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              A collection of intelligent tools designed to make
              customer support and business knowledge easier.
            </p>

          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/10 bg-[#10192B] p-7 transition hover:-translate-y-1 hover:border-blue-500/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">
            <p className="font-semibold uppercase tracking-widest text-blue-400">
              Simple workflow
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Get started in three steps
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">

            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/10 bg-[#10192B] p-8"
              >
                <span className="text-4xl font-bold text-blue-500/50">
                  {step.number}
                </span>

                <h3 className="mt-6 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ABOUT / BENEFITS */}
      <section id="about" className="bg-[#0B1221] px-6 py-24">

        <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">

          <div>
            <p className="font-semibold uppercase tracking-widest text-blue-400">
              Built for every industry
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight">
              One platform.
              <br />
              Endless possibilities.
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              Whether you manage a hotel, online store, educational
              institution or technology company, BizAssist AI gives
              you a foundation for building a business-specific
              assistant.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-blue-400 hover:text-blue-300"
            >
              Create your workspace
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#10192B] p-8">

            <h3 className="text-xl font-bold">
              Your BizAssist workspace
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Capabilities planned for your business
            </p>

            <div className="mt-8 space-y-5">

              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check size={15} />
                  </div>

                  <span className="text-sm text-slate-300">
                    {benefit}
                  </span>
                </div>
              ))}

            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">

        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-[#10192B] px-7 py-16 text-center md:px-16">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
            <Sparkles size={28} />
          </div>

          <h2 className="mt-7 text-4xl font-bold">
            Ready to make your business smarter?
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
            Create your workspace and start building an AI
            assistant designed around your business.
          </p>

          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500"
          >
            Get Started
            <ArrowRight size={19} />
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">

          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot size={23} className="text-blue-400" />
            BizAssist AI
          </Link>

          <p className="text-sm text-slate-500">
            © {2026} BizAssist AI. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-white">
              Login
            </Link>

            <Link href="/register" className="hover:text-white">
              Register
            </Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
