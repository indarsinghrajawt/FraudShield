"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Alert = Record<string, any>;

export default function FraudAlertsPage() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAlerts() {
      try {
        const response = await fetch(
          "http://localhost:8000/admin/alerts",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || data.authenticated === false) {
          router.replace("/admin");
          return;
        }

        setAlerts(data.alerts || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load fraud alerts.");
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, [router]);

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
          <p className="text-sm font-semibold text-red-400">
            SECURITY MONITORING
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Fraud Alerts
          </h1>

          <p className="mt-2 text-gray-400">
            Review transactions detected as potentially fraudulent.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Total Alerts
            </p>

            <p className="mt-3 text-3xl font-bold text-red-400">
              {alerts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Status
            </p>

            <p className="mt-3 text-xl font-semibold text-orange-400">
              Monitoring
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Detection Engine
            </p>

            <p className="mt-3 text-xl font-semibold text-cyan-400">
              Active
            </p>
          </div>

        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1424]">

          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-semibold">
              Suspicious Transactions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Fraudulent transactions detected by the system.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Loading fraud alerts...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-400">
              {error}
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-10 text-center text-green-400">
              No fraud alerts found.
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b border-white/10 text-sm text-gray-500">
                <tr>
                  <th className="p-5">
                    #
                  </th>

                  <th className="p-5">
                    Transaction
                  </th>

                  <th className="p-5">
                    Amount
                  </th>

                  <th className="p-5">
                    Category
                  </th>

                  <th className="p-5">
                    Hour
                  </th>

                  <th className="p-5">
                    Risk
                  </th>

                  <th className="p-5">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {alerts.map((alert, index) => {

                  const transactionId =
                    alert.TransactionID ??
                    alert.transaction_id ??
                    alert.id ??
                    index + 1;

                  const amount =
                    alert.Amount ??
                    alert.amount ??
                    alert.TransactionAmount ??
                    alert.transaction_amount ??
                    "-";

                  const category =
                    alert.Category ??
                    alert.category ??
                    "-";

                  const hour =
                    alert.Hour ??
                    alert.hour ??
                    "-";

                  return (
                    <tr
                      key={index}
                      className="border-b border-white/5 transition hover:bg-red-500/[0.03]"
                    >

                      <td className="p-5 text-gray-500">
                        #{transactionId}
                      </td>

                      <td className="p-5 font-semibold">
                        Transaction #{transactionId}
                      </td>

                      <td className="p-5 text-gray-300">
                        ₹{amount}
                      </td>

                      <td className="p-5 text-gray-400">
                        {category}
                      </td>

                      <td className="p-5 text-gray-400">
                        {hour}
                      </td>

                      <td className="p-5">
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-400">
                          🚨 FRAUD
                        </span>
                      </td>

                      <td className="p-5">
                        <button
                          onClick={() =>
                            router.push(
                              `/transactions/${transactionId}`
                            )
                          }
                          className="rounded-lg border border-cyan-400/20 px-3 py-2 text-sm text-cyan-400 transition hover:bg-cyan-400/10"
                        >
                          View Details →
                        </button>
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          )}

        </div>

      </div>

    </main>
  );
}