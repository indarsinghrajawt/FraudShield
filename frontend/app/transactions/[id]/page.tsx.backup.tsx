"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TransactionDetail() {
  const params = useParams();
  const id = params.id;
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/transactions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTx(data.transaction);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-[#070b14] p-10 text-white">Loading transaction...</main>;
  }

  if (!tx) {
    return <main className="min-h-screen bg-[#070b14] p-10 text-white">Transaction not found</main>;
  }

  const fraud = Number(tx.FraudIndicator) === 1;

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-cyan-400">FRAUDSHIELD / TRANSACTION</p>

        <h1 className="mt-2 text-4xl font-bold">
          Transaction #{tx.TransactionID}
        </h1>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-7">
            <h2 className="text-xl font-semibold">Transaction Details</h2>

            <div className="mt-6 space-y-5">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span>₹{Number(tx.Amount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Transaction Amount</span>
                <span>₹{Number(tx.TransactionAmount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span>{tx.Category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Anomaly Score</span>
                <span>{Number(tx.AnomalyScore).toFixed(3)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp</span>
                <span>{tx.Timestamp}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-7 ${
            fraud
              ? "border-red-500/30 bg-red-500/5"
              : "border-green-500/30 bg-green-500/5"
          }`}>
            <h2 className="text-xl font-semibold">Detection Result</h2>

            <div className="mt-10 text-center">
              <div className="text-6xl">
                {fraud ? "🚨" : "🛡️"}
              </div>

              <div className={`mt-5 text-4xl font-bold ${
                fraud ? "text-red-400" : "text-green-400"
              }`}>
                {fraud ? "FRAUD DETECTED" : "NORMAL"}
              </div>

              <p className="mt-4 text-gray-400">
                Stored fraud indicator: {tx.FraudIndicator}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-7">
          <p className="text-sm text-cyan-400">INTELLIGENCE</p>

          <h2 className="mt-2 text-2xl font-semibold">
            Transaction Analysis
          </h2>

          <p className="mt-3 text-gray-400">
            This transaction has an anomaly score of{" "}
            {Number(tx.AnomalyScore).toFixed(3)} and belongs to the{" "}
            {tx.Category} category.
          </p>
        </div>
      </div>
    </main>
  );
}