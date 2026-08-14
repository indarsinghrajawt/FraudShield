"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  TransactionID?: number;
  Amount?: number;
  TransactionAmount?: number;
  Category?: string;
  AnomalyScore?: number;
  Timestamp?: string;
  FraudIndicator?: number;
  [key: string]: any;
};

type TransactionsResponse = {
  count: number;
  transactions: Transaction[];
};

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/transactions"
        );

        if (!response.ok) {
          throw new Error("Failed to load transactions");
        }

        const data: TransactionsResponse =
          await response.json();

        setTransactions(data.transactions || []);
      } catch (err: any) {
        setError(
          err.message || "Unable to load transactions"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">

      <div className="mx-auto max-w-7xl">

        <button
          onClick={() => router.push("/")}
          className="mb-8 text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">

          <p className="text-sm font-semibold text-cyan-400">
            TRANSACTION INTELLIGENCE
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Transactions
          </h1>

          <p className="mt-2 text-gray-400">
            Review transaction activity and investigate
            suspicious transactions.
          </p>

        </div>

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Total Loaded
            </p>

            <p className="mt-3 text-3xl font-bold">
              {transactions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Fraud Cases
            </p>

            <p className="mt-3 text-3xl font-bold text-red-400">
              {
                transactions.filter(
                  (t) => Number(t.FraudIndicator) === 1
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Normal
            </p>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {
                transactions.filter(
                  (t) => Number(t.FraudIndicator) !== 1
                ).length
              }
            </p>
          </div>

        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1424]">

          <div className="border-b border-white/10 p-6">

            <h2 className="text-xl font-semibold">
              Transaction Activity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select a transaction to investigate.
            </p>

          </div>

          {loading ? (

            <div className="p-12 text-center text-gray-400">
              Loading transactions...
            </div>

          ) : error ? (

            <div className="p-12 text-center text-red-400">
              {error}
            </div>

          ) : transactions.length === 0 ? (

            <div className="p-12 text-center text-gray-400">
              No transactions found.
            </div>

          ) : (

            <table className="w-full min-w-[850px] text-left">

              <thead className="border-b border-white/10 text-sm text-gray-500">

                <tr>
                  <th className="p-5">ID</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Anomaly</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Action</th>
                </tr>

              </thead>

              <tbody>

                {transactions.map((transaction) => {

                  const fraud =
                    Number(transaction.FraudIndicator) === 1;

                  return (
                    <tr
                      key={transaction.TransactionID}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >

                      <td className="p-5 font-semibold">
                        #{transaction.TransactionID}
                      </td>

                      <td className="p-5">
                        ₹
                        {Number(
                          transaction.Amount ?? 0
                        ).toFixed(2)}
                      </td>

                      <td className="p-5 text-gray-400">
                        {transaction.Category || "-"}
                      </td>

                      <td className="p-5 text-gray-400">
                        {Number(
                          transaction.AnomalyScore ?? 0
                        ).toFixed(3)}
                      </td>

                      <td className="p-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            fraud
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {fraud ? "FRAUD" : "NORMAL"}
                        </span>

                      </td>

                      <td className="p-5">

                        <button
                          onClick={() =>
                            router.push(
                              `/transactions/${transaction.TransactionID}`
                            )
                          }
                          className="rounded-lg border border-cyan-500/30 px-4 py-2 text-sm text-cyan-400 transition hover:border-cyan-400 hover:bg-cyan-500/10"
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