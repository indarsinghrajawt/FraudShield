"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Analytics = {
  total_transactions: number;
  fraud_transactions: number;
  normal_transactions: number;
  fraud_rate: number;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const authResponse = await fetch(
          "http://localhost:8000/admin/me",
          {
            credentials: "include",
          }
        );

        const authData = await authResponse.json();

        if (!authData.authenticated) {
          router.replace("/admin");
          return;
        }

        setCheckingAuth(false);

        const analyticsResponse = await fetch(
          "http://localhost:8000/analytics",
          {
            credentials: "include",
          }
        );

        const data = await analyticsResponse.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Authentication error:", error);
        router.replace("/admin");
      }
    }

    checkAdmin();
  }, [router]);

  async function logout() {
    try {
      await fetch(
        "http://localhost:8000/admin/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      router.replace("/admin");
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <div className="text-center">
          <div className="text-4xl">🛡️</div>
          <p className="mt-4 text-gray-400">
            Verifying administrator access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">

      <header className="border-b border-white/10 bg-[#0b1020] px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              🛡️ Fraud<span className="text-cyan-400">Shield</span>
            </h1>

            <p className="text-sm text-gray-500">
              Administrator Control Center
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            Logout
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-7xl p-6 md:p-10">

        <div className="mb-8">
          <p className="text-sm text-cyan-400">
            ADMINISTRATION
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Control Center
          </h2>

          <p className="mt-2 text-gray-400">
            Manage and monitor the FraudShield platform.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Transactions
            </p>

            <p className="mt-3 text-3xl font-bold">
              {analytics?.total_transactions ?? "..."}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Fraud Cases
            </p>

            <p className="mt-3 text-3xl font-bold text-red-400">
              {analytics?.fraud_transactions ?? "..."}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Normal
            </p>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {analytics?.normal_transactions ?? "..."}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Fraud Rate
            </p>

            <p className="mt-3 text-3xl font-bold text-orange-400">
              {analytics ? `${analytics.fraud_rate}%` : "..."}
            </p>
          </div>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-7">

            <h3 className="text-xl font-semibold">
              Platform Management
            </h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <button
                onClick={() => router.push("/transactions")}
                className="rounded-xl border border-white/10 bg-[#070b14] p-5 text-left transition hover:border-cyan-400"
              >
                <div className="text-2xl">
                  💳
                </div>

                <p className="mt-3 font-semibold">
                  Transactions
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  View transaction activity
                </p>
              </button>

              <button
                onClick={() => router.push("/admin/analytics")}
                className="rounded-xl border border-white/10 bg-[#070b14] p-5 text-left transition hover:border-cyan-400"
              >
                <div className="text-2xl">
                  🚨
                </div>

                <p className="mt-3 font-semibold">
                  Fraud Alerts
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Review suspicious activity
                </p>
              </button>

              <button
                onClick={() => router.push("/admin/analytics")}
                className="rounded-xl border border-white/10 bg-[#070b14] p-5 text-left transition hover:border-cyan-400"
              >
                <div className="text-2xl">
                  📊
                </div>

                <p className="mt-3 font-semibold">
                  Analytics
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Platform performance
                </p>
              </button>

              <button
                onClick={() => router.push("/admin/analytics")}
                className="rounded-xl border border-white/10 bg-[#070b14] p-5 text-left transition hover:border-cyan-400"
              >
                <div className="text-2xl">
                  ⚙️
                </div>

                <p className="mt-3 font-semibold">
                  Settings
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Configure the platform
                </p>
              </button>

            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-7">

            <h3 className="text-xl font-semibold">
              System Health
            </h3>

            <div className="mt-7 space-y-5">

              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  Fraud API
                </span>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                  ● Online
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  ML Engine
                </span>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                  ● Online
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  Dataset
                </span>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                  ● Loaded
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  Authentication
                </span>

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-400">
                  ● Protected
                </span>
              </div>

            </div>
          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-7">

          <p className="text-sm text-cyan-400">
            ADMIN ACCESS
          </p>

          <h3 className="mt-2 text-2xl font-semibold">
            Full platform control
          </h3>

          <p className="mt-2 text-gray-400">
            Administrator authentication is handled by the
            FraudShield backend.
          </p>

        </div>

      </section>
    </main>
  );
}