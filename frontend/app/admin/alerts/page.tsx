"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Alert = Record<string, any>;

export default function FraudAlertsPage() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  async function loadAlerts() {
    try {
      setLoading(true);

      const response = await fetch(
        "https://fraudshield-cvly.onrender.com/admin/alerts",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || data.authenticated === false) {
        router.replace("/admin");
        return;
      }

      setAlerts(data.alerts || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load fraud alerts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        alerts
          .map((alert) => alert.Category)
          .filter(Boolean)
      )
    );
  }, [alerts]);

  const filteredAlerts = alerts.filter((alert) => {
    const value = search.toLowerCase().trim();

    const transactionId =
      alert.TransactionID ??
      alert.transaction_id ??
      alert.id ??
      "";

    const customerId =
      alert.CustomerID ??
      alert.customer_id ??
      "";

    const matchesSearch =
      value === "" ||
      String(transactionId)
        .toLowerCase()
        .includes(value) ||
      String(customerId)
        .toLowerCase()
        .includes(value) ||
      String(alert.Category ?? "")
        .toLowerCase()
        .includes(value);

    const matchesCategory =
      category === "ALL" ||
      alert.Category === category;

    return matchesSearch && matchesCategory;
  });

  const totalAlerts = alerts.length;

  const averageAnomaly =
    totalAlerts > 0
      ? alerts.reduce(
          (sum, alert) =>
            sum +
            Number(
              alert.AnomalyScore ??
                alert.anomaly_score ??
                0
            ),
          0
        ) / totalAlerts
      : 0;

  return (
    <main className="min-h-screen bg-[#050912] text-white">

      <div className="mx-auto max-w-[1500px] p-6 md:p-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <button
              onClick={() => router.push("/")}
              className="mb-5 text-sm text-cyan-400 transition hover:text-cyan-300"
            >
              ← Back to Dashboard
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              FRAUDSHIELD / SECURITY
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Fraud Alerts
            </h1>

            <p className="mt-2 text-gray-500">
              Review transactions detected as potentially fraudulent.
            </p>

          </div>

          <button
            onClick={loadAlerts}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:border-cyan-400/30 hover:text-white"
          >
            ↻ Refresh Alerts
          </button>

        </div>

        {/* STATS */}

        <div className="grid gap-5 md:grid-cols-3">

          <AlertStat
            title="Total Alerts"
            value={totalAlerts.toLocaleString()}
            subtitle="Detected suspicious cases"
            type="red"
          />

          <AlertStat
            title="Average Anomaly"
            value={averageAnomaly.toFixed(3)}
            subtitle="Across active alerts"
            type="orange"
          />

          <AlertStat
            title="Status"
            value="ACTIVE"
            subtitle="Monitoring current dataset"
            type="cyan"
          />

        </div>

        {/* SEARCH */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a111f]">

          <div className="border-b border-white/10 p-6">

            <div className="flex flex-col gap-4 lg:flex-row">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search Transaction ID, Customer ID or Category..."
                className="flex-1 rounded-xl border border-white/10 bg-[#070c17] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-cyan-400/50"
              />

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="rounded-xl border border-white/10 bg-[#070c17] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                <option value="ALL">
                  All Categories
                </option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

            </div>

            <div className="mt-4 flex items-center justify-between">

              <p className="text-xs text-gray-600">
                Showing {filteredAlerts.length} of{" "}
                {totalAlerts} alerts
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCategory("ALL");
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Clear filters
              </button>

            </div>

          </div>

          {/* CONTENT */}

          {loading ? (

            <div className="p-16 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-red-400" />

              <p className="text-gray-500">
                Loading fraud alerts...
              </p>

            </div>

          ) : error ? (

            <div className="p-16 text-center">

              <p className="text-red-400">
                {error}
              </p>

              <button
                onClick={loadAlerts}
                className="mt-5 rounded-xl border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-cyan-400/30"
              >
                Retry
              </button>

            </div>

          ) : filteredAlerts.length === 0 ? (

            <div className="p-16 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-400/20 bg-green-400/5 text-3xl">
                ✓
              </div>

              <h2 className="text-xl font-semibold">
                No Fraud Alerts
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                No suspicious transactions match the current filters.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px] text-left">

                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-500">

                  <tr>

                    <th className="px-6 py-4">
                      Transaction
                    </th>

                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Category
                    </th>

                    <th className="px-6 py-4">
                      Anomaly
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-white/5">

                  {filteredAlerts.map(
                    (alert, index) => {

                      const transactionId =
                        alert.TransactionID ??
                        alert.transaction_id ??
                        alert.id ??
                        index + 1;

                      const customerId =
                        alert.CustomerID ??
                        alert.customer_id ??
                        "—";

                      const amount = Number(
                        alert.Amount ??
                          alert.TransactionAmount ??
                          alert.transaction_amount ??
                          0
                      );

                      const anomaly = Number(
                        alert.AnomalyScore ??
                          alert.anomaly_score ??
                          0
                      );

                      return (
                        <tr
                          key={`${transactionId}-${index}`}
                          className="transition hover:bg-white/[0.025]"
                        >

                          <td className="px-6 py-5">

                            <p className="font-semibold">
                              #{transactionId}
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {alert.Timestamp ??
                                alert.timestamp ??
                                "No timestamp"}
                            </p>

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-400">
                            {customerId}
                          </td>

                          <td className="px-6 py-5 font-semibold">
                            ₹{amount.toFixed(2)}
                          </td>

                          <td className="px-6 py-5">

                            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300">
                              {alert.Category ??
                                "Other"}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <span className="font-semibold text-orange-400">
                              {anomaly.toFixed(3)}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <span className="rounded-full bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-400">
                              🚨 FRAUD
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <button
                              onClick={() =>
                                router.push(
                                  `/transactions/${transactionId}`
                                )
                              }
                              className="rounded-lg border border-cyan-400/20 px-4 py-2 text-xs font-semibold text-cyan-400 transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
                            >
                              View Details →
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* SECURITY FOOTER */}

        <section className="mt-6 rounded-2xl border border-red-500/20 bg-[#170b12] p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs uppercase tracking-widest text-red-400">
                Security Monitoring
              </p>

              <h3 className="mt-2 text-xl font-bold">
                FraudShield alert engine active
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Alerts are generated from the currently active transaction dataset.
              </p>

            </div>

            <div className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-semibold text-green-400">
              ● SYSTEM ACTIVE
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

function AlertStat({
  title,
  value,
  subtitle,
  type,
}: {
  title: string;
  value: string;
  subtitle: string;
  type: "red" | "orange" | "cyan";
}) {
  const border = {
    red: "border-red-500/30 bg-red-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
    cyan: "border-cyan-500/30 bg-cyan-500/5",
  };

  const text = {
    red: "text-red-400",
    orange: "text-orange-400",
    cyan: "text-cyan-400",
  };

  return (
    <div
      className={`rounded-2xl border p-6 ${border[type]}`}
    >

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${text[type]}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-600">
        {subtitle}
      </p>

    </div>
  );
}
