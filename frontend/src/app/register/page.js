
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(form);

      localStorage.setItem("bizassist_token", data.token);
      localStorage.setItem(
        "bizassist_user",
        JSON.stringify(data.user)
      );

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white">
          Create your account
        </h1>

        <p className="text-slate-400 mt-2 mb-7">
          Start building your AI business assistant.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          <input
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder="Business name"
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password (minimum 8 characters)"
            minLength={8}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-slate-400 text-center mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
