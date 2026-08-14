"use client";

import { useEffect, useState } from "react";

type Transaction = {
  TransactionID: number;
  Amount: number;
  TransactionAmount: number;
  AnomalyScore: number;
  Category: string;
  FraudIndicator: number;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/transactions?limit=100")
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions))
      .catch(console.error);
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      String(tx.TransactionID).includes(search) ||
      tx.Category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "fraud" && tx.FraudIndicator === 1) ||
      (filter === "normal" && tx.FraudIndicator === 0);

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm text-cyan-400">
            FRAUDSHIELD
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Transaction Intelligence
          </h1>

          <p className="mt-2 text-gray-400">
            Monitor and investigate transaction activity.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-[#0d1424] p-4 outline-none focus:border-cyan-400"
            placeholder="Search transaction ID or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="rounded-xl border border-white/10 bg-[#0d1424] p-4"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="fraud">Fraud Only</option>
            <option value="normal">Normal Only</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1424]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Anomaly</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.TransactionID}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="p-4 font-medium">
                      TXN-{tx.TransactionID}
                    </td>

                    <td className="p-4">
                      ₹{tx.Amount.toFixed(2)}
                    </td>

                    <td className="p-4 text-gray-300">
                      {tx.Category}
                    </td>

                    <td className="p-4">
                      {tx.AnomalyScore.toFixed(3)}
                    </td>

                    <td className="p-4">
                      {tx.FraudIndicator === 1 ? (
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400">
                          🚨 Fraud
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                          ● Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} transactions
        </p>

      </div>
    </main>
  );
}
