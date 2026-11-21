
"use client";

import { useEffect, useState } from "react";

type PlatformSettings = {
  totalJourneyDays: number;
  withdrawalQualificationDays: number;
  referralQualificationDays: number;
  requiredReferrals: number;
  minimumWithdrawal: number;
   dailyLoginReward: number;
};

const defaultSettings: PlatformSettings = {
  totalJourneyDays: 100,
  withdrawalQualificationDays: 30,
  referralQualificationDays: 30,
  requiredReferrals: 10,
  minimumWithdrawal: 10000,
    dailyLoginReward: 100,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load settings");
        }

        setSettings(data.settings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(
    field: keyof PlatformSettings,
    value: string
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value === "" ? 0 : Number(value),
    }));
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings(data.settings);
      setMessage("Platform settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading platform settings...</div>;
  }

  const fields: {
    key: keyof PlatformSettings;
    label: string;
    description: string;
    min: number;
  }[] = [
    {
      key: "totalJourneyDays",
      label: "Total Journey Days",
      description: "Total number of days in the user reward journey.",
      min: 1,
    },
    {
      key: "withdrawalQualificationDays",
      label: "Withdrawal Qualification Days",
      description: "Completed days required before a user can withdraw.",
      min: 1,
    },
    {
      key: "referralQualificationDays",
      label: "Referral Qualification Days",
      description: "Completed days required for a referral to qualify.",
      min: 1,
    },
    {
      key: "requiredReferrals",
      label: "Required Qualified Referrals",
      description: "Number of qualified referrals required.",
      min: 1,
    },
    {
      key: "minimumWithdrawal",
      label: "Minimum Withdrawal Amount (₦)",
      description: "Minimum amount a user can request to withdraw.",
      min: 1,
    },
    {
  key: "dailyLoginReward",
  label: "Daily Login Reward (₦)",
  description: "Reward users receive when their daily login claim is approved.",
  min: 1,
},
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the reward journey, referral rules and withdrawals.
        </p>
      </div>

      <form
        onSubmit={saveSettings}
        className="max-w-3xl space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        {fields.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={field.key}
              className="block text-sm font-semibold"
            >
              {field.label}
            </label>

            <p className="mt-1 text-xs text-gray-500">
              {field.description}
            </p>

            <input
              id={field.key}
              type="number"
              min={field.min}
              step="1"
              required
              value={settings[field.key]}
              onChange={(event) =>
                updateField(field.key, event.target.value)
              }
              className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        ))}

        {message && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
