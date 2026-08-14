"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Transaction = {
  TransactionID?: number;
  Amount?: number;
  TransactionAmount?: number;
  Category?: string;
  AnomalyScore?: number;
  Timestamp?: string;
  FraudIndicator?: number;
};

export default function TransactionDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = params?.id;

    if (!id) return;

    async function loadTransaction() {
      try {
        const response = await fetch(
          `http://localhost:8000/transactions/${id}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(
            data.error || "Transaction not found"
          );
        }

        setTransaction(data.transaction);
      } catch (err: any) {
        setError(
          err.message || "Unable to load transaction"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransaction();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <p className="text-gray-400">
          Loading transaction...
        </p>
      </main>
    );
  }

  if (error || !transaction) {
    return (
      <main className="min-h-screen bg-[#070b14] p-8 text-white">
        <div className="mx-auto max-w-5xl">

          <button
            onClick={() => router.push("/admin/alerts")}
            className="mb-8 text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Fraud Alerts
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-red-400">
            {error || "Transaction not found"}
          </div>

        </div>
      </main>
    );
  }

  const isFraud =
    Number(transaction.FraudIndicator ?? 0) === 1;

  const anomaly =
    Number(transaction.AnomalyScore ?? 0);

  const anomalyPercent = Math.min(
    Math.max(anomaly * 100, 0),
    100
  );

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">

      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <button
            onClick={() =>
              router.push("/admin/alerts")
            }
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Fraud Alerts
          </button>

          <span className="text-xs text-gray-600">
            FRAUDSHIELD / TRANSACTION
          </span>

        </div>

        <div className="mb-8">

          <p className="text-sm font-semibold text-cyan-400">
            FRAUD INVESTIGATION
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Transaction #{transaction.TransactionID}
          </h1>

          <p className="mt-2 text-gray-400">
            Detailed transaction risk analysis.
          </p>

        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-7">

            <h2 className="text-xl font-semibold">
              Transaction Details
            </h2>

            <div className="mt-7 space-y-5">

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Amount
                </span>

                <span className="font-semibold">
                  ₹{Number(transaction.Amount ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Transaction Amount
                </span>

                <span className="font-semibold">
                  ₹{Number(
                    transaction.TransactionAmount ?? 0
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Category
                </span>

                <span className="font-semibold">
                  {transaction.Category || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Anomaly Score
                </span>

                <span className="font-semibold">
                  {anomaly.toFixed(3)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Timestamp
                </span>

                <span className="text-right font-semibold">
                  {transaction.Timestamp || "-"}
                </span>
              </div>

            </div>

          </div>

          <div
            className={`rounded-2xl border p-7 ${
              isFraud
                ? "border-red-500/30 bg-red-500/5"
                : "border-green-500/30 bg-green-500/5"
            }`}
          >

            <h2 className="text-xl font-semibold">
              Detection Result
            </h2>

            <div className="mt-8 text-center">

              <div className="text-6xl">
                {isFraud ? "🚨" : "🛡️"}
              </div>

              <h2
                className={`mt-5 text-3xl font-bold ${
                  isFraud
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {isFraud
                  ? "FRAUD DETECTED"
                  : "NORMAL TRANSACTION"}
              </h2>

              <p className="mt-3 text-gray-400">
                Stored fraud indicator:{" "}
                <span className="font-semibold text-white">
                  {Number(
                    transaction.FraudIndicator ?? 0
                  )}
                </span>
              </p>

            </div>

          </div>

        </div>

        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-7">

          <p className="text-sm font-semibold text-cyan-400">
            INTELLIGENCE
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Risk Analysis
          </h2>

          <p className="mt-3 text-gray-400">
            FraudShield detected this transaction as{" "}
            <span
              className={
                isFraud
                  ? "font-semibold text-red-400"
                  : "font-semibold text-green-400"
              }
            >
              {isFraud ? "fraudulent" : "normal"}
            </span>{" "}
            based on the stored fraud indicator.
          </p>

          <div className="mt-7">

            <div className="mb-2 flex justify-between">

              <span className="text-sm text-gray-400">
                Anomaly Score
              </span>

              <span className="text-sm font-semibold">
                {anomaly.toFixed(3)}
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/5">

              <div
                className={`h-full rounded-full ${
                  isFraud
                    ? "bg-red-500"
                    : "bg-cyan-500"
                }`}
                style={{
                  width: `${anomalyPercent}%`,
                }}
              />

            </div>

          </div>

        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
            <p className="text-xs text-gray-500">
              CATEGORY
            </p>

            <p className="mt-2 text-lg font-semibold">
              {transaction.Category || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
            <p className="text-xs text-gray-500">
              ANOMALY SCORE
            </p>

            <p className="mt-2 text-lg font-semibold">
              {anomaly.toFixed(3)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
            <p className="text-xs text-gray-500">
              STATUS
            </p>

            <p
              className={`mt-2 text-lg font-semibold ${
                isFraud
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {isFraud ? "FRAUD" : "NORMAL"}
            </p>
          </div>

        </div>

      </div>

    </main>
  );
}