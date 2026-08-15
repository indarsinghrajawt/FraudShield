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

  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);

      const response = await fetch(
        "https://fraudshield-cvly.onrender.com/analytics",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load analytics.");
      }

      const data = await response.json();

      setAnalytics(data);
      setError("");
    } catch (err: any) {
      console.error("Analytics error:", err);
      setError(
        err.message || "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050912] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="text-gray-500">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050912] text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400">
            {error || "Unable to load analytics."}
          </p>

          <button
            onClick={loadAnalytics}
            className="mt-5 rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-black"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const total = analytics.total_transactions;
  const fraud = analytics.fraud_transactions;
  const normal = analytics.normal_transactions;
  const fraudRate = analytics.fraud_rate;

  const normalPercent =
    total > 0 ? (normal / total) * 100 : 0;

  const fraudPercent =
    total > 0 ? (fraud / total) * 100 : 0;

  const maxCategory =
    analytics.categories.length > 0
      ? Math.max(
          ...analytics.categories.map(
            (item) => item.transactions
          )
        )
      : 1;

  return (
    <main className="min-h-screen bg-[#050912] text-white">

      <div className="mx-auto max-w-[1500px] p-6 md:p-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <button
              onClick={() =>
                router.push("/")
              }
              className="mb-6 text-sm text-cyan-400 transition hover:text-cyan-300"
            >
              ← Back to Dashboard
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
              FRAUDSHIELD / INTELLIGENCE
            </p>

            <h1 className="mt-2 text-4xl font-bold md:text-5xl">
              Analytics
            </h1>

            <p className="mt-3 text-gray-500">
              Real-time intelligence from the active fraud detection dataset.
            </p>

          </div>

          <button
            onClick={loadAnalytics}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/10"
          >
            ↻ Refresh Data
          </button>

        </div>

        {/* KPI CARDS */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <Metric
            title="Total Transactions"
            value={total.toLocaleString()}
            subtitle="Active dataset"
            icon="T"
            className="border-cyan-500/20 bg-cyan-500/5"
            iconClass="bg-cyan-500/10 text-cyan-400"
          />

          <Metric
            title="Fraud Transactions"
            value={fraud.toLocaleString()}
            subtitle="Detected suspicious"
            icon="F"
            className="border-red-500/20 bg-red-500/5"
            iconClass="bg-red-500/10 text-red-400"
          />

          <Metric
            title="Normal Transactions"
            value={normal.toLocaleString()}
            subtitle="Legitimate activity"
            icon="N"
            className="border-green-500/20 bg-green-500/5"
            iconClass="bg-green-500/10 text-green-400"
          />

          <Metric
            title="Fraud Rate"
            value={`${fraudRate}%`}
            subtitle="Overall risk ratio"
            icon="%"
            className="border-orange-500/20 bg-orange-500/5"
            iconClass="bg-orange-500/10 text-orange-400"
          />

        </div>

        {/* CHART ROW */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.25fr]">

          {/* DONUT CHART */}

          <section className="rounded-2xl border border-white/10 bg-[#0a111f] p-6">

            <div className="mb-6">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Distribution
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Fraud vs Normal
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Transaction classification across the current dataset.
              </p>

            </div>

            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center">

              <div
                className="relative h-64 w-64 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    #ef4444 0 ${fraudPercent}%,
                    #22c55e ${fraudPercent}% 100%
                  )`,
                }}
              >

                <div className="absolute inset-[24px] flex flex-col items-center justify-center rounded-full bg-[#0a111f]">

                  <span className="text-4xl font-bold">
                    {fraudRate}%
                  </span>

                  <span className="mt-1 text-sm text-gray-500">
                    Fraud Rate
                  </span>

                </div>

              </div>

              <div className="w-full max-w-xs space-y-4">

                <Legend
                  label="Normal"
                  value={normal}
                  percent={normalPercent}
                  dot="bg-green-400"
                  text="text-green-400"
                />

                <Legend
                  label="Fraud"
                  value={fraud}
                  percent={fraudPercent}
                  dot="bg-red-400"
                  text="text-red-400"
                />

                <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">

                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Detection Summary
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    {fraud.toLocaleString()} suspicious transactions
                    detected from {total.toLocaleString()} total records.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* RISK OVERVIEW */}

          <section className="rounded-2xl border border-white/10 bg-[#0a111f] p-6">

            <div className="mb-6">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Risk Overview
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Dataset Risk Profile
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current fraud concentration and detection health.
              </p>

            </div>

            <div className="space-y-6">

              <RiskBar
                label="Normal Transactions"
                value={normal}
                percent={normalPercent}
                barClass="bg-green-400"
                valueClass="text-green-400"
              />

              <RiskBar
                label="Fraud Transactions"
                value={fraud}
                percent={fraudPercent}
                barClass="bg-red-500"
                valueClass="text-red-400"
              />

              <div className="grid gap-4 pt-3 md:grid-cols-3">

                <RiskCard
                  title="Detection"
                  value="ACTIVE"
                  className="text-green-400"
                />

                <RiskCard
                  title="Dataset"
                  value="LIVE"
                  className="text-cyan-400"
                />

                <RiskCard
                  title="Risk Level"
                  value={
                    fraudRate >= 10
                      ? "HIGH"
                      : fraudRate >= 5
                      ? "MEDIUM"
                      : "LOW"
                  }
                  className={
                    fraudRate >= 10
                      ? "text-red-400"
                      : fraudRate >= 5
                      ? "text-orange-400"
                      : "text-green-400"
                  }
                />

              </div>

            </div>

          </section>

        </div>

        {/* CATEGORY CHART */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a111f] p-6">

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Category Intelligence
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Transaction Volume by Category
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Compare transaction volume and fraud exposure.
              </p>

            </div>

            <div className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-500">
              {analytics.categories.length} categories
            </div>

          </div>

          {analytics.categories.length === 0 ? (

            <div className="mt-8 rounded-xl border border-dashed border-white/10 p-10 text-center">

              <p className="text-gray-400">
                No category information available in this dataset.
              </p>

            </div>

          ) : (

            <div className="mt-8 space-y-7">

              {analytics.categories.map((item, index) => {

                const volumePercent =
                  maxCategory > 0
                    ? (item.transactions /
                        maxCategory) *
                      100
                    : 0;

                return (
                  <div key={`${item.Category}-${index}`}>

                    <div className="mb-2 flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-400">
                          {index + 1}
                        </span>

                        <span className="truncate font-semibold">
                          {item.Category || "Unknown"}
                        </span>

                      </div>

                      <div className="shrink-0 text-right">

                        <span className="font-semibold">
                          {item.transactions.toLocaleString()}
                        </span>

                        <span className="ml-2 text-xs text-gray-600">
                          transactions
                        </span>

                      </div>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/5">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{
                          width: `${Math.max(
                            volumePercent,
                            2
                          )}%`,
                        }}
                      />

                    </div>

                    <div className="mt-2 flex justify-between text-xs">

                      <span className="text-gray-600">
                        {item.fraud_cases.toLocaleString()} fraud cases
                      </span>

                      <span
                        className={
                          item.fraud_rate >= 10
                            ? "text-red-400"
                            : item.fraud_rate >= 5
                            ? "text-orange-400"
                            : "text-gray-500"
                        }
                      >
                        {item.fraud_rate}% fraud rate
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        {/* BOTTOM INSIGHTS */}

        <div className="mt-6 grid gap-6 md:grid-cols-3">

          <Insight
            title="Total Records"
            value={total.toLocaleString()}
            description="Records currently analyzed by FraudShield."
          />

          <Insight
            title="Fraud Detected"
            value={fraud.toLocaleString()}
            description="Transactions classified as suspicious."
          />

          <Insight
            title="Current Risk"
            value={`${fraudRate}%`}
            description="Fraud percentage across the active dataset."
          />

        </div>

        {/* FOOTER STATUS */}

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="font-semibold">
              FraudShield Intelligence Engine
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Analytics calculated from the latest active dataset.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-full bg-green-400/10 px-4 py-2 text-sm text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            System Operational
          </div>

        </div>

      </div>

    </main>
  );
}

function Metric({
  title,
  value,
  subtitle,
  icon,
  className,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  className: string;
  iconClass: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold md:text-4xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

function Legend({
  label,
  value,
  percent,
  dot,
  text,
}: {
  label: string;
  value: number;
  percent: number;
  dot: string;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">

      <div className="flex items-center gap-3">

        <span
          className={`h-3 w-3 rounded-full ${dot}`}
        />

        <span className="text-sm text-gray-400">
          {label}
        </span>

      </div>

      <div className="text-right">

        <p className={`font-bold ${text}`}>
          {value.toLocaleString()}
        </p>

        <p className="text-xs text-gray-600">
          {percent.toFixed(2)}%
        </p>

      </div>

    </div>
  );
}

function RiskBar({
  label,
  value,
  percent,
  barClass,
  valueClass,
}: {
  label: string;
  value: number;
  percent: number;
  barClass: string;
  valueClass: string;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm text-gray-400">
          {label}
        </span>

        <span className={`font-semibold ${valueClass}`}>
          {value.toLocaleString()}
        </span>

      </div>

      <div className="h-4 overflow-hidden rounded-full bg-white/5">

        <div
          className={`h-full rounded-full ${barClass}`}
          style={{
            width: `${Math.max(
              percent,
              percent > 0 ? 1 : 0
            )}%`,
          }}
        />

      </div>

      <p className="mt-2 text-right text-xs text-gray-600">
        {percent.toFixed(2)}%
      </p>

    </div>
  );
}

function RiskCard({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">

      <p className="text-xs uppercase tracking-wider text-gray-600">
        {title}
      </p>

      <p className={`mt-2 font-bold ${className}`}>
        {value}
      </p>

    </div>
  );
}

function Insight({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a111f] p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-gray-600">
        {description}
      </p>

    </div>
  );
}
