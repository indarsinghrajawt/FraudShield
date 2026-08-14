"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Analytics = {
  total_transactions: number;
  fraud_transactions: number;
  normal_transactions: number;
  fraud_rate: number;
};

export default function Home() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Analytics error:", err));
  }, []);

  const total = analytics?.total_transactions ?? 0;
  const fraud = analytics?.fraud_transactions ?? 0;
  const normal = analytics?.normal_transactions ?? 0;
  const rate = analytics?.fraud_rate ?? 0;

  const normalPercent = total ? (normal / total) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <div className="flex min-h-screen">

        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#080d19] md:block">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 text-xl">
                S
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  Fraud<span className="text-cyan-400">Shield</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                  AI Fraud Detection
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 p-4">
            <NavButton active onClick={() => router.push("/")}>
              Dashboard
            </NavButton>

            <NavButton onClick={() => router.push("/transactions")}>
              Transactions
            </NavButton>

            <NavButton onClick={() => router.push("/predict")}>
              Risk Analysis
            </NavButton>

            <NavButton onClick={() => router.push("/admin/alerts")}>
              Alerts
            </NavButton>

            <NavButton onClick={() => router.push("/admin/analytics")}>
              Analytics
            </NavButton>
          </nav>

          <div className="mt-10 px-4">
            <button
              onClick={() => router.push("/transactions")}
              className="w-full rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-left text-sm text-violet-300 transition hover:bg-violet-500/10"
            >
              + CSV Upload
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-white/10 bg-[#070c17] px-6 py-5 md:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                AI Fraud Intelligence
              </p>
              <h2 className="mt-1 text-3xl font-bold">
                Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Real-time fraud detection overview
              </p>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right">
                <p className="text-sm font-semibold">Admin</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                A
              </div>
            </div>
          </header>

          <div className="p-6 md:p-10">

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <Metric
                title="Total Transactions"
                value={total.toLocaleString()}
                description="All time transactions"
                icon="T"
                type="blue"
              />

              <Metric
                title="Fraud Transactions"
                value={fraud.toLocaleString()}
                description="Detected as fraud"
                icon="F"
                type="red"
              />

              <Metric
                title="Normal Transactions"
                value={normal.toLocaleString()}
                description="Legitimate transactions"
                icon="N"
                type="green"
              />

              <Metric
                title="Fraud Rate"
                value={`${rate}%`}
                description="Fraction of total"
                icon="%"
                type="orange"
              />

            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

              <section className="rounded-2xl border border-white/10 bg-[#0a111f] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      Transactions Overview
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Current fraud and normal distribution
                    </p>
                  </div>

                  <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs text-green-400">
                    LIVE
                  </span>
                </div>

                <div className="mt-10 space-y-8">

                  <Bar
                    title="Normal"
                    value={normal}
                    percent={normalPercent}
                    textClass="text-green-400"
                    barClass="bg-gradient-to-r from-cyan-400 to-green-400"
                  />

                  <Bar
                    title="Fraud"
                    value={fraud}
                    percent={rate}
                    textClass="text-red-400"
                    barClass="bg-gradient-to-r from-red-500 to-orange-400"
                  />

                </div>

                <div className="mt-10 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                  <p className="text-xs uppercase tracking-widest text-violet-400">
                    FraudShield Engine
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    AI-powered transaction risk detection
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Every transaction can be evaluated by the trained
                    machine-learning model.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#0a111f] p-6">
                <h3 className="text-xl font-bold">
                  Transaction Distribution
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Fraud vs normal
                </p>

                <div className="mt-8 flex justify-center">
                  <div
                    className="relative flex h-48 w-48 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#22c55e ${normalPercent}%, #ef4444 ${normalPercent}% 100%)`,
                    }}
                  >
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#0a111f]">
                      <span className="text-3xl font-bold">
                        {rate}%
                      </span>
                      <span className="text-xs text-gray-500">
                        Fraud
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <InfoRow
                    label="Normal"
                    value={normal}
                    percent={normalPercent}
                    dot="bg-green-400"
                  />
                  <InfoRow
                    label="Fraud"
                    value={fraud}
                    percent={rate}
                    dot="bg-red-400"
                  />
                </div>
              </section>

            </div>

            <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a111f] p-6">
              <h3 className="text-xl font-bold">
                Quick Actions
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Manage and investigate your fraud dataset
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-4">

                <Action
                  title="Transactions"
                  description="View transaction activity"
                  onClick={() => router.push("/transactions")}
                />

                <Action
                  title="Risk Analysis"
                  description="Analyze transaction risk"
                  onClick={() => router.push("/predict")}
                />

                <Action
                  title="Fraud Alerts"
                  description="Review suspicious activity"
                  onClick={() => router.push("/admin/alerts")}
                />

                <Action
                  title="Analytics"
                  description="Platform performance"
                  onClick={() => router.push("/admin/analytics")}
                />

              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-[#07131d] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-cyan-400">
                    System Status
                  </p>
                  <h3 className="mt-2 text-xl font-bold">
                    FraudShield Engine
                  </h3>
                </div>

                <span className="rounded-full bg-green-400/10 px-4 py-2 text-xs text-green-400">
                  ● All Systems Operational
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Status name="ML Model" value="Online" />
                <Status name="Fraud API" value="Online" />
                <Status name="Dataset" value="Loaded" />
              </div>
            </section>

          </div>
        </section>
      </div>
    </main>
  );
}

function NavButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Metric({
  title,
  value,
  description,
  icon,
  type,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
  type: "blue" | "red" | "green" | "orange";
}) {
  const styles = {
    blue: "border-blue-500/30 bg-blue-500/5",
    red: "border-red-500/30 bg-red-500/5",
    green: "border-green-500/30 bg-green-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
  };

  const iconStyles = {
    blue: "text-blue-400 bg-blue-400/10",
    red: "text-red-400 bg-red-400/10",
    green: "text-green-400 bg-green-400/10",
    orange: "text-orange-400 bg-orange-400/10",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition hover:-translate-y-1 ${styles[type]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${iconStyles[type]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Bar({
  title,
  value,
  percent,
  textClass,
  barClass,
}: {
  title: string;
  value: number;
  percent: number;
  textClass: string;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="text-sm text-gray-400">
          {title}
        </span>
        <span className={`font-semibold ${textClass}`}>
          {value.toLocaleString()}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  percent,
  dot,
}: {
  label: string;
  value: number;
  percent: number;
  dot: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="text-sm text-gray-400">
          {label}
        </span>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-600">
          {percent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

function Action({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-[#070c17] p-5 text-left transition hover:-translate-y-1 hover:border-violet-500/50 hover:bg-violet-500/5"
    >
      <p className="font-semibold">
        {title}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </button>
  );
}

function Status({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <span className="text-sm text-gray-400">
        {name}
      </span>
      <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs text-green-400">
        ● {value}
      </span>
    </div>
  );
}
