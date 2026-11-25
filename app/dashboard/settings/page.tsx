
"use client";

import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";


export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load profile.");
      }

      setName(data.user.name);
      setEmail(data.user.email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

//   useState(() => {
//     loadProfile();
//   });

useEffect(() => {
  loadProfile();
}, []);

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setProfileLoading(true);

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update profile.");
      }

      setName(data.name);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and security.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Profile settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-green-50 p-3 text-green-600">
            <User size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500">
              Update your personal information.
            </p>
          </div>
        </div>

        <form onSubmit={updateProfile} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={60}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail size={15} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Email address cannot currently be changed.
            </p>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={17} />
            {profileLoading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {/* Password settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Lock size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">
              Keep your account secure with a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={changePassword} className="space-y-5">
          {[
            {
              label: "Current Password",
              value: currentPassword,
              setter: setCurrentPassword,
              visible: showCurrent,
              toggle: () => setShowCurrent(!showCurrent),
            },
            {
              label: "New Password",
              value: newPassword,
              setter: setNewPassword,
              visible: showNew,
              toggle: () => setShowNew(!showNew),
            },
            {
              label: "Confirm New Password",
              value: confirmPassword,
              setter: setConfirmPassword,
              visible: showConfirm,
              toggle: () => setShowConfirm(!showConfirm),
            },
          ].map((field) => (
            <div key={field.label}>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {field.label}
              </label>

              <div className="relative">
                <input
                  type={field.visible ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  required
                  minLength={field.label === "Current Password" ? undefined : 8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={field.toggle}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {field.visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Lock size={17} />
            {passwordLoading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </section>

      {/* Account security information */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-50 p-3 text-green-600">
            <ShieldCheck size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Account Security</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Your account is protected by session-based authentication.
              Never share your password or login details with anyone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
