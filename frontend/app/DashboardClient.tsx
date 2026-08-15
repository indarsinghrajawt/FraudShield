"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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

export default function Dashboard() {
  const router = useRouter();

  const [data, setData] = useState<Analytics | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const response = await fetch(
        "https://fraudshield-cvly.onrender.com/analytics",
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Analytics unavailable");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  if (!mounted || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050814] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="mt-4 text-sm text-gray-500">
            Loading FraudShield...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050814] px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#090f1d] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            FraudShield Backend Unavailable
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Unable to connect to the production analytics API.
          </p>

          <p className="mt-4 rounded-lg bg-black/30 p-3 text-xs text-red-400">
            {error || "No analytics data received"}
          </p>

          <button
            onClick={loadData}
            className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }
  const total = data.total_transactions;
  const fraud = data.fraud_transactions;
  const normal = data.normal_transactions;
  const fraudRate = data.fraud_rate;

  const pieData = [
    { name: "Normal", value: normal },
    { name: "Fraud", value: fraud },
  ];

  const barData = [
    {
      name: "Transactions",
      Normal: normal,
      Fraud: fraud,
    },
  ];

  const categories = [...(data.categories || [])]
    .filter((item) => item.Category !== "All Transactions")
    .slice(0, 8);

  return (
    <main className="min-h-screen bg-[#050814] text-white">

      {/* SIDEBAR */}

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] border-r border-white/10 bg-[#070b16] lg:block">

        <div className="flex h-24 items-center border-b border-white/10 px-7">
          <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-xl font-black">
            S
          </div>

          <div>
            <h1 className="text-xl font-bold">
              Fraud<span className="text-cyan-400">Shield</span>
            </h1>

            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              AI Fraud Detection
            </p>
          </div>
        </div>

        <nav className="space-y-2 p-5">

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl bg-violet-600/20 px-4 py-3 text-left font-medium text-violet-300 ring-1 ring-violet-500/30"
          >
            Dashboard
          </button>

          <button
            onClick={() => router.push("/transactions")}
            className="w-full rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Transactions
          </button>

          <button
            onClick={() => router.push("/predict")}
            className="w-full rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Risk Analysis
          </button>

          <button
            onClick={() => router.push("/admin/alerts")}
            className="w-full rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Alerts
          </button>

          <button
            onClick={() => router.push("/admin/analytics")}
            className="w-full rounded-xl px-4 py-3 text-left text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Analytics
          </button>

          <div className="pt-7">
            <button
              onClick={() => router.push("/transactions")}
              className="w-full rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-left font-medium text-violet-300 transition hover:bg-violet-500/20"
            >
              + CSV Upload
            </button>
          </div>

        </nav>
      </aside>

      {/* MAIN */}

      <div className="lg:pl-[260px]">

        {/* HEADER */}

        <header className="flex items-center justify-between border-b border-white/10 bg-[#060a14]/90 px-6 py-6 backdrop-blur-xl md:px-10">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              AI FRAUD INTELLIGENCE
            </p>

            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Real-time fraud detection overview
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="font-semibold">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
              A
            </div>
          </div>

        </header>

        <div className="p-6 md:p-10">

          {/* KPI */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Transactions"
              value={total.toLocaleString()}
              subtitle="All time transactions"
              icon="T"
              type="blue"
            />

            <StatCard
              title="Fraud Transactions"
              value={fraud.toLocaleString()}
              subtitle="Detected as fraud"
              icon="F"
              type="red"
            />

            <StatCard
              title="Normal Transactions"
              value={normal.toLocaleString()}
              subtitle="Legitimate transactions"
              icon="N"
              type="green"
            />

            <StatCard
              title="Fraud Rate"
              value={`${fraudRate}%`}
              subtitle="Fraction of total"
              icon="%"
              type="orange"
            />

          </div>

          {/* CHART ROW */}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">

            {/* BAR CHART */}

            <section className="rounded-2xl border border-white/10 bg-[#090f1d] p-6 shadow-2xl">

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    TRANSACTIONS
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Fraud vs Normal
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Current transaction classification
                  </p>
                </div>

                <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                  ● LIVE
                </span>
              </div>

              <div className="mt-8 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                    />

                    <YAxis
                      stroke="#64748b"
                      tickFormatter={(value) =>
                        value >= 1000
                          ? `${Math.round(value / 1000)}k`
                          : value
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#0b1220",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />

                    <Bar
                      dataKey="Normal"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                      barSize={70}
                    />

                    <Bar
                      dataKey="Fraud"
                      fill="#ef4444"
                      radius={[8, 8, 0, 0]}
                      barSize={70}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </section>

            {/* DONUT */}

            <section className="rounded-2xl border border-white/10 bg-[#090f1d] p-6 shadow-2xl">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                DISTRIBUTION
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Fraud Distribution
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Fraud vs legitimate activity
              </p>

              <div className="relative mt-4 h-[270px]">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={3}
                      stroke="none"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#0b1220",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">
                    {fraudRate}%
                  </span>
                  <span className="text-xs text-gray-500">
                    Fraud Rate
                  </span>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <LegendCard
                  label="Normal"
                  value={normal}
                  percent={
                    total
                      ? ((normal / total) * 100).toFixed(2)
                      : "0"
                  }
                  dot="green"
                />

                <LegendCard
                  label="Fraud"
                  value={fraud}
                  percent={
                    total
                      ? ((fraud / total) * 100).toFixed(2)
                      : "0"
                  }
                  dot="red"
                />

              </div>

            </section>

          </div>

          {/* RISK PROFILE */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#090f1d] p-6">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  RISK OVERVIEW
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Dataset Risk Profile
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Current fraud concentration and detection health
                </p>
              </div>

              <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                <p className="text-xs text-gray-500">CURRENT RISK</p>
                <p className="mt-1 font-bold text-green-400">
                  {fraudRate >= 5
                    ? "HIGH"
                    : fraudRate >= 1
                    ? "MEDIUM"
                    : "LOW"}
                </p>
              </div>

            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <RiskBar
                label="Normal Transactions"
                value={normal}
                total={total}
                percent={total ? (normal / total) * 100 : 0}
                type="green"
              />

              <RiskBar
                label="Fraud Transactions"
                value={fraud}
                total={total}
                percent={total ? (fraud / total) * 100 : 0}
                type="red"
              />

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <HealthCard
                title="DETECTION"
                value="ACTIVE"
                description="Fraud engine operational"
                type="green"
              />

              <HealthCard
                title="DATASET"
                value="LIVE"
                description={`${total.toLocaleString()} records loaded`}
                type="cyan"
              />

              <HealthCard
                title="RISK LEVEL"
                value={
                  fraudRate >= 5
                    ? "HIGH"
                    : fraudRate >= 1
                    ? "MEDIUM"
                    : "LOW"
                }
                description={`${fraud.toLocaleString()} suspicious records`}
                type="green"
              />

            </div>

          </section>

          {/* CATEGORY CHART */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#090f1d] p-6">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  CATEGORY INTELLIGENCE
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Transaction Volume
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Transaction activity by category
                </p>
              </div>

              <span className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-500">
                {categories.length} categories
              </span>
            </div>

            {categories.length > 0 ? (
              <div className="mt-8 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categories}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 30,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />

                    <XAxis
                      type="number"
                      stroke="#64748b"
                    />

                    <YAxis
                      dataKey="Category"
                      type="category"
                      width={90}
                      stroke="#94a3b8"
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#0b1220",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />

                    <Bar
                      dataKey="transactions"
                      fill="#06b6d4"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-white/10 p-8 text-center text-gray-500">
                Category data is not available in the current dataset.
              </div>
            )}

          </section>

          {/* QUICK ACTIONS */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#090f1d] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              QUICK ACTIONS
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Investigate Your Dataset
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-4">

              <Action
                title="Transactions"
                subtitle="View transaction activity"
                onClick={() => router.push("/transactions")}
              />

              <Action
                title="Risk Analysis"
                subtitle="Analyze transaction risk"
                onClick={() => router.push("/predict")}
              />

              <Action
                title="Fraud Alerts"
                subtitle="Review suspicious activity"
                onClick={() => router.push("/admin/alerts")}
              />

              <Action
                title="Analytics"
                subtitle="Advanced platform analytics"
                onClick={() => router.push("/admin/analytics")}
              />

            </div>

          </section>

          {/* FOOTER STATUS */}

          <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  SYSTEM STATUS
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  FraudShield Engine
                </h2>
              </div>

              <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400">
                ● All Systems Operational
              </span>

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <Status title="ML Model" value="Online" />
              <Status title="Fraud API" value="Online" />
              <Status title="Dataset" value="Loaded" />

            </div>

          </section>

        </div>
      </div>

    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  type,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  type: string;
}) {
  const styles: Record<string, string> = {
    blue: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    red: "border-red-500/30 bg-red-500/5 text-red-400",
    green: "border-green-500/30 bg-green-500/5 text-green-400",
    orange: "border-orange-500/30 bg-orange-500/5 text-orange-400",
  };

  return (
    <div className={`rounded-2xl border p-6 ${styles[type]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 font-bold">
          {icon}
        </div>
      </div>
    </div>
  );
}

function LegendCard({
  label,
  value,
  percent,
  dot,
}: {
  label: string;
  value: number;
  percent: string;
  dot: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-3 w-3 rounded-full ${
            dot === "green" ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <span className="text-sm text-gray-400">{label}</span>
      </div>

      <div className="mt-3 text-xl font-bold">
        {value.toLocaleString()}
      </div>

      <div className="text-xs text-gray-600">
        {percent}%
      </div>
    </div>
  );
}

function RiskBar({
  label,
  value,
  total,
  percent,
  type,
}: {
  label: string;
  value: number;
  total: number;
  percent: number;
  type: string;
}) {
  return (
    <div>
      <div className="mb-3 flex justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <span
          className={
            type === "green"
              ? "font-semibold text-green-400"
              : "font-semibold text-red-400"
          }
        >
          {value.toLocaleString()}
        </span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            type === "green"
              ? "bg-gradient-to-r from-cyan-500 to-green-400"
              : "bg-gradient-to-r from-orange-500 to-red-500"
          }`}
          style={{
            width: `${Math.max(percent, value > 0 ? 1 : 0)}%`,
          }}
        />
      </div>

      <div className="mt-2 text-right text-xs text-gray-600">
        {percent.toFixed(2)}% of {total.toLocaleString()}
      </div>
    </div>
  );
}

function HealthCard({
  title,
  value,
  description,
  type,
}: {
  title: string;
  value: string;
  description: string;
  type: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs tracking-widest text-gray-600">
        {title}
      </p>

      <p
        className={`mt-3 text-xl font-bold ${
          type === "cyan"
            ? "text-cyan-400"
            : "text-green-400"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-600">
        {description}
      </p>
    </div>
  );
}

function Action({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-[#060a14] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/5"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-gray-500">
        {subtitle}
      </p>
    </button>
  );
}

function Status({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-5 py-4">
      <span className="text-sm text-gray-400">
        {title}
      </span>

      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
        ● {value}
      </span>
    </div>
  );
}