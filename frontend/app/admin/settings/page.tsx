"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: string;
};

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  autoRefresh: true,
  refreshInterval: "30",
};

export default function SettingsPage() {
  const router = useRouter();

  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "fraudshield_settings"
      );

      if (saved) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        });
      }
    } catch {
      console.error("Unable to read settings");
    }
  }, []);

  function update<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
  }

  function saveSettings() {
    localStorage.setItem(
      "fraudshield_settings",
      JSON.stringify(settings)
    );

    setMessage("Settings saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  return (
    <main className="min-h-screen bg-[#050912] text-white">

      <div className="mx-auto max-w-5xl p-6 md:p-10">

        <button
          onClick={() => router.push("/admin/dashboard")}
          className="mb-6 text-sm text-cyan-400 hover:text-cyan-300"
        >
          Back to Admin Dashboard
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          FRAUDSHIELD / CONFIGURATION
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Configure dashboard behaviour and monitoring preferences.
        </p>

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#0a111f]">

          <div className="border-b border-white/10 p-6">

            <h2 className="text-xl font-bold">
              Dashboard Preferences
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              These settings are saved locally in this browser.
            </p>

          </div>

          <div className="divide-y divide-white/5">

            <SettingRow
              title="Fraud Notifications"
              description="Enable fraud alert notifications."
              enabled={settings.notifications}
              onToggle={() =>
                update(
                  "notifications",
                  !settings.notifications
                )
              }
            />

            <SettingRow
              title="Automatic Refresh"
              description="Refresh dashboard data automatically."
              enabled={settings.autoRefresh}
              onToggle={() =>
                update(
                  "autoRefresh",
                  !settings.autoRefresh
                )
              }
            />

            <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="font-semibold">
                  Refresh Interval
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how frequently data should refresh.
                </p>

              </div>

              <select
                value={settings.refreshInterval}
                onChange={(e) =>
                  update(
                    "refreshInterval",
                    e.target.value
                  )
                }
                disabled={!settings.autoRefresh}
                className="rounded-xl border border-white/10 bg-[#070c17] px-5 py-3 text-white outline-none focus:border-cyan-400/50 disabled:opacity-40"
              >
                <option value="15">
                  Every 15 seconds
                </option>

                <option value="30">
                  Every 30 seconds
                </option>

                <option value="60">
                  Every 60 seconds
                </option>

                <option value="120">
                  Every 2 minutes
                </option>

              </select>

            </div>

          </div>

        </section>

        <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="font-semibold">
                Save Configuration
              </p>

              {message ? (
                <p className="mt-1 text-sm text-green-400">
                  {message}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Apply your current preferences.
                </p>
              )}

            </div>

            <button
              onClick={saveSettings}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              Save Settings
            </button>

          </div>

        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <Status
            name="API Connection"
            status="Online"
          />

          <Status
            name="Fraud Engine"
            status="Active"
          />

          <Status
            name="Dataset"
            status="Live"
          />

        </section>

      </div>

    </main>
  );
}

function SettingRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">

      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition ${
          enabled
            ? "bg-cyan-500"
            : "bg-white/10"
        }`}
        aria-label={`Toggle ${title}`}
      >

        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

function Status({
  name,
  status,
}: {
  name: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0a111f] p-4">

      <span className="text-sm text-gray-400">
        {name}
      </span>

      <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs text-green-400">
        {status}
      </span>

    </div>
  );
}
