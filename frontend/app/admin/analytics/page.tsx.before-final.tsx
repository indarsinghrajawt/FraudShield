"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  Category: string;
  transactions: number;
  fraud_cases: number;
  fraud_rate: number;
};

type Analytics = {
  total_transactions: number;
  fraud_transactions: number;
  normal_transactions: number;
  fraud_rate: number;
  distribution: {
    fraud: number;
    normal: number;
  };
  categories: Category[];
};

export default function AnalyticsPage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
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

        const response = await fetch(
          "http://localhost:8000/analytics",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        setAnalytics(data);
      } catch (error) {
        console.error("Analytics error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <p className="text-gray-400">
          Loading analytics...
        </p>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <p className="text-red-400">
          Unable to load analytics.
        </p>
      </main>
    );
  }

  const maxTransactions = Math.max(
    ...analytics.categories.map((item) => item.transactions)
  );

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">

      <div className="mx-auto max-w-7xl">

        <button
          onClick={() => router.push("/admin/dashboard")}
          className="mb-6 text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm text-cyan-400">
            PLATFORM INTELLIGENCE
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Analytics
          </h1>

          <p className="mt-2 text-gray-400">
            Fraud detection performance and transaction intelligence.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Total Transactions
            </p>

            <p className="mt-3 text-3xl font-bold">
              {analytics.total_transactions}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Fraud Cases
            </p>

            <p className="mt-3 text-3xl font-bold text-red-400">
              {analytics.fraud_transactions}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Normal
            </p>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {analytics.normal_transactions}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Fraud Rate
            </p>

            <p className="mt-3 text-3xl font-bold text-orange-400">
              {analytics.fraud_rate}%
            </p>
          </div>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-7">

            <h2 className="text-xl font-semibold">
              Fraud Distribution
            </h2>

            <div className="mt-8 space-y-6">

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-gray-400">
                    Normal
                  </span>

                  <span className="font-semibold text-green-400">
                    {analytics.distribution.normal}
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${
                        (analytics.distribution.normal /
                          analytics.total_transactions) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-gray-400">
                    Fraud
                  </span>

                  <span className="font-semibold text-red-400">
                    {analytics.distribution.fraud}
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${
                        (analytics.distribution.fraud /
                          analytics.total_transactions) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-7">

            <h2 className="text-xl font-semibold">
              Risk Overview
            </h2>

            <div className="mt-8">

              <div className="flex items-center justify-center">

                <div className="flex h-48 w-48 items-center justify-center rounded-full border-[18px] border-red-500/70">

                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {analytics.fraud_rate}%
                    </p>

                    <p className="text-sm text-gray-500">
                      Fraud Rate
                    </p>
                  </div>

                </div>

              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                Fraud cases detected across all transactions.
              </p>

            </div>

          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0d1424] p-7">

          <h2 className="text-xl font-semibold">
            Category Performance
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Transaction volume and fraud detection by category.
          </p>

          <div className="mt-8 space-y-6">

            {analytics.categories.map((category) => (

              <div key={category.Category}>

                <div className="mb-2 flex items-center justify-between">

                  <div>
                    <span className="font-semibold">
                      {category.Category}
                    </span>

                    <span className="ml-3 text-sm text-gray-500">
                      {category.transactions} transactions
                    </span>
                  </div>

                  <span className="text-sm text-red-400">
                    {category.fraud_cases} fraud
                    {" · "}
                    {category.fraud_rate}%
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{
                      width: `${
                        (category.transactions /
                          maxTransactions) *
                        100
                      }%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>
    </main>
  );
}