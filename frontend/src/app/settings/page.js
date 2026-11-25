
"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  BriefcaseBusiness,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const initialForm = {
  name: "",
  industry: "",
  description: "",
  contactEmail: "",
  phone: "",
  website: "",
  address: "",
};

export default function SettingsPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Owner profile state
const [ownerProfile, setOwnerProfile] = useState({
  name: "",
  email: "",
});

const [ownerLoading, setOwnerLoading] = useState(true);
const [ownerSaving, setOwnerSaving] = useState(false);
const [ownerError, setOwnerError] = useState("");
const [ownerSuccess, setOwnerSuccess] = useState("");

const [passwordForm, setPasswordForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const [passwordSaving, setPasswordSaving] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");

const handlePasswordSubmit = async (e) => {
  e.preventDefault();

  setPasswordError("");
  setPasswordSuccess("");

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordError("New passwords do not match.");
    return;
  }

  if (passwordForm.newPassword.length < 8) {
    setPasswordError("Password must contain at least 8 characters.");
    return;
  }

  try {
    setPasswordSaving(true);

    const token = localStorage.getItem("bizassist_token");

    const response = await fetch(
      `${API_URL}/auth/change-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password.");
    }

    setPasswordSuccess("Password changed successfully!");

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  } catch (err) {
    setPasswordError(err.message);
  } finally {
    setPasswordSaving(false);
  }
};

// Load business profile.

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("bizassist_token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/business/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load business profile.");
      }

      setForm({
        ...initialForm,
        ...data.business,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Fetch logged-in owner's profile
const fetchOwnerProfile = async () => {
  try {
    setOwnerLoading(true);
    setOwnerError("");

    const token = localStorage.getItem("bizassist_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load owner profile.");
    }

    setOwnerProfile({
      name: data.user.name || "",
      email: data.user.email || "",
    });
  } catch (err) {
    setOwnerError(err.message);
  } finally {
    setOwnerLoading(false);
  }
};

// Handle owner profile input changes
const handleOwnerChange = (e) => {
  const { name, value } = e.target;

  setOwnerProfile((previous) => ({
    ...previous,
    [name]: value,
  }));

  setOwnerError("");
  setOwnerSuccess("");
};

// Save owner profile
const handleOwnerSubmit = async (e) => {
  e.preventDefault();

  try {
    setOwnerSaving(true);
    setOwnerError("");
    setOwnerSuccess("");

    const token = localStorage.getItem("bizassist_token");

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ownerProfile),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update owner profile.");
    }

    setOwnerProfile({
      name: data.user.name,
      email: data.user.email,
    });

    // Update the locally stored user information
    const storedUser = JSON.parse(
      localStorage.getItem("bizassist_user") || "{}"
    );

    localStorage.setItem(
      "bizassist_user",
      JSON.stringify({
        ...storedUser,
        name: data.user.name,
        email: data.user.email,
      })
    );

    setOwnerSuccess("Owner profile updated successfully!");
  } catch (err) {
    setOwnerError(err.message);
  } finally {
    setOwnerSaving(false);
  }
};
  useEffect(() => {
    fetchBusinessProfile();
    fetchOwnerProfile();
  }, []);
  
  // Handle form inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // Save business profile.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("bizassist_token");

      const response = await fetch(`${API_URL}/business/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          industry: form.industry,
          description: form.description,
          contactEmail: form.contactEmail,
          phone: form.phone,
          website: form.website,
          address: form.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update business profile.");
      }

      setForm({
        ...initialForm,
        ...data.business,
      });

      setSuccess("Business profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading business settings...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-indigo-600">Settings</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Business Settings
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your business information and contact details.
            </p>
          </div>

          {/* Information Card */}
          <div className="mb-6 flex items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="rounded-xl bg-white p-3 text-indigo-600">
              <Building2 size={24} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Business Profile
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Keep your business information accurate. BizAssist AI
                uses this information to understand your business
                and provide better customer assistance.
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 size={19} />
              {success}
            </div>
          )}

          {/* Form */}

{/* Owner Profile Section */}
<section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

  <div className="mb-6 flex items-center gap-3">
    <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
      <BriefcaseBusiness size={21} />
    </div>

    <div>
      <h2 className="font-semibold text-gray-900">
        Owner Profile
      </h2>
      <p className="text-sm text-gray-500">
        Manage your personal account information.
      </p>
    </div>
  </div>

  {ownerError && (
    <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle size={18} />
      {ownerError}
    </div>
  )}

  {ownerSuccess && (
    <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
      <CheckCircle2 size={18} />
      {ownerSuccess}
    </div>
  )}

  {ownerLoading ? (
    <div className="flex items-center gap-3 py-6 text-gray-500">
      <RefreshCw size={19} className="animate-spin" />
      Loading owner profile...
    </div>
  ) : (
    <form onSubmit={handleOwnerSubmit}>
      <div className="grid gap-5 md:grid-cols-2">

        <div>
          <label className={labelClass}>
            Owner Name *
          </label>

          <input
            type="text"
            name="name"
            value={ownerProfile.name}
            onChange={handleOwnerChange}
            className={inputClass}
            placeholder="Enter your name"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            Login Email *
          </label>

          <input
            type="email"
            name="email"
            value={ownerProfile.email}
            onChange={handleOwnerChange}
            className={inputClass}
            placeholder="Enter your email"
            required
          />
        </div>

      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={ownerSaving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ownerSaving ? (
            <>
              <RefreshCw size={17} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Update Profile
            </>
          )}
        </button>
      </div>
    </form>
  )}
</section>

{/* Change Password Section */}
<section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

  <div className="mb-6 flex items-center gap-3">
    <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
      <LockKeyhole size={21} />
    </div>

    <div>
      <h2 className="font-semibold text-gray-900">
        Change Password
      </h2>
      <p className="text-sm text-gray-500">
        Keep your account secure with a strong password.
      </p>
    </div>
  </div>

  {passwordError && (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {passwordError}
    </div>
  )}

  {passwordSuccess && (
    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
      {passwordSuccess}
    </div>
  )}

  <form onSubmit={handlePasswordSubmit}>
    <div className="grid gap-5 md:grid-cols-2">

      <div className="md:col-span-2">
        <label className={labelClass}>
          Current Password *
        </label>
        <input
          type="password"
          value={passwordForm.currentPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              currentPassword: e.target.value,
            })
          }
          className={inputClass}
          placeholder="Enter current password"
          required
        />
      </div>

      <div>
        <label className={labelClass}>
          New Password *
        </label>
        <input
          type="password"
          value={passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              newPassword: e.target.value,
            })
          }
          className={inputClass}
          placeholder="Minimum 8 characters"
          minLength={8}
          maxLength={128}
          required
        />
      </div>

      <div>
        <label className={labelClass}>
          Confirm New Password *
        </label>
        <input
          type="password"
          value={passwordForm.confirmPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              confirmPassword: e.target.value,
            })
          }
          className={inputClass}
          placeholder="Confirm new password"
          minLength={8}
          maxLength={128}
          required
        />
      </div>

    </div>

    <div className="mt-6 flex justify-end">
      <button
        type="submit"
        disabled={passwordSaving}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {passwordSaving ? (
          <>
            <RefreshCw size={17} className="animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <LockKeyhole size={17} />
            Change Password
          </>
        )}
      </button>
    </div>
  </form>
</section>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">

              {/* Basic Information */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <Building2 size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Basic Information
                    </h2>
                    <p className="text-sm text-gray-500">
                      Tell us about your business.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className={labelClass}>
                      Business Name *
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Enter business name"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Industry
                    </label>

                    <input
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. Technology, Healthcare"
                      maxLength={100}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Business Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className={inputClass}
                      rows={4}
                      placeholder="Describe your business, products and services..."
                      maxLength={1000}
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                      {form.description.length}/1000 characters
                    </p>
                  </div>

                </div>
              </section>

              {/* Contact Information */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Mail size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Contact Information
                    </h2>
                    <p className="text-sm text-gray-500">
                      How customers can contact your business.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className={labelClass}>
                      Contact Email
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />

                      <input
                        type="email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="+91 9876543210"
                        maxLength={30}
                      />
                    </div>
                  </div>

                </div>
              </section>

              {/* Online Presence */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                    <Globe size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Online Presence & Location
                    </h2>
                    <p className="text-sm text-gray-500">
                      Your website and business address.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5">

                  <div>
                    <label className={labelClass}>
                      Website
                    </label>

                    <div className="relative">
                      <Globe className="absolute left-3 top-3.5 text-gray-400" size={18} />

                      <input
                        type="text"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        placeholder="https://example.com"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Business Address
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />

                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className={`${inputClass} pl-10`}
                        rows={3}
                        placeholder="Enter your business address"
                        maxLength={300}
                      />
                    </div>
                  </div>

                </div>
              </section>

              {/* Save Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText size={18} />
                  Your changes are saved to your business profile.
                </div>

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={fetchBusinessProfile}
                    disabled={saving}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Save Changes
                      </>
                    )}
                  </button>

                </div>
              </div>

            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
