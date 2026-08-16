"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  TransactionID?: number;
  Amount?: number;
  CustomerID?: number;
  Timestamp?: string;
  MerchantID?: number;
  TransactionAmount?: number;
  AnomalyScore?: number;
  Category?: string;
  FraudIndicator?: number;
  [key: string]: any;
};

export default function TransactionsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalFraudCount, setTotalFraudCount] = useState(0);
  const [totalFraud, setTotalFraud] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  async function loadTransactions() {
    try {
      setLoading(true);

      const response = await fetch(
        "https://fraudshield-cvly.onrender.com/transactions?limit=100",
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Failed to load transactions");
      }

      const data = await response.json();

      setTransactions(data.transactions || []);
      setTotalTransactions(Number(data.total ?? 0));
      setTotalFraudCount(Number(data.fraud_count ?? 0));
      setError("");
    } catch (err: any) {
      setError(err.message || "Unable to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleCSVUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://fraudshield-cvly.onrender.com/transactions/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "CSV upload failed");
      }

      setUploadMessage(
        `CSV uploaded successfully - ${data.uploaded_rows} rows loaded.`
      );

      await loadTransactions();
    } catch (err: any) {
      setError(err.message || "Unable to upload CSV");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const fraud = Number(transaction.FraudIndicator) === 1;
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      searchValue === "" ||
      String(transaction.TransactionID ?? "")
        .toLowerCase()
        .includes(searchValue) ||
      String(transaction.CustomerID ?? "")
        .toLowerCase()
        .includes(searchValue) ||
      String(transaction.Category ?? "")
        .toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "FRAUD" && fraud) ||
      (statusFilter === "NORMAL" && !fraud);

    const matchesCategory =
      categoryFilter === "ALL" ||
      transaction.Category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const fraudCount = totalFraudCount;

  const normalCount = totalTransactions - totalFraudCount;

  const categories = Array.from(
    new Set(
      transactions
        .map((t) => t.Category)
        .filter(Boolean)
    )
  );

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
              Back to Dashboard
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              FRAUDSHIELD / TRANSACTIONS
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Transaction Activity
            </h1>

            <p className="mt-2 text-gray-500">
              Review, search and investigate transactions from the active dataset.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 font-semibold shadow-lg shadow-violet-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "+ Upload CSV"}
            </button>
          </div>

        </div>

        {/* MESSAGES */}
        {uploadMessage && (
          <div className="mb-6 rounded-xl border border-green-400/20 bg-green-400/5 p-4 text-sm text-green-400">
              {uploadMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-5 md:grid-cols-3">

          <StatCard
            title="Total Transactions"
            value={transactions.length}
            subtitle="Active dataset"
            type="blue"
          />

          <StatCard
            title="Normal"
            value={normalCount}
            subtitle="Legitimate transactions"
            type="green"
          />

          <StatCard
            title="Fraud"
            value={fraudCount}
            subtitle="Detected suspicious cases"
            type="red"
          />

        </div>

        {/* FILTERS */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a111f]">

          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col gap-4 lg:flex-row">

              <div className="relative flex-1">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Transaction ID, Customer ID or Category..."
                  className="w-full rounded-xl border border-white/10 bg-[#070c17] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#070c17] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                <option value="ALL">All Status</option>
                <option value="FRAUD">Fraud Only</option>
                <option value="NORMAL">Normal Only</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#070c17] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                <option value="ALL">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </span>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="text-cyan-400 hover:text-cyan-300"
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            {loading ? (
              <div className="p-16 text-center text-gray-500">
                Loading transactions...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-lg font-semibold">
                  No transactions found
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1000px] text-left">

                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Anomaly</th>
                    <th className="px-6 py-4">Risk</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">

                  {filteredTransactions.map((transaction) => {

                    const id = transaction.TransactionID;
                    const fraud =
                      Number(transaction.FraudIndicator) === 1;

                    const amount =
                      Number(transaction.Amount ?? 0);

                    const anomaly =
                      Number(transaction.AnomalyScore ?? 0);

                    return (
                      <tr
                        key={id}
                        className="transition hover:bg-white/[0.025]"
                      >

                        <td className="px-6 py-5">
                          <div className="font-semibold">
                            #{id}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {transaction.Timestamp || "No timestamp"}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-400">
                          {transaction.CustomerID ?? "-"}
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          Rs.{amount.toFixed(2)}
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300">
                            {transaction.Category || "Other"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={
                              anomaly >= 0.5
                                ? "text-orange-400"
                                : "text-gray-400"
                            }
                          >
                            {anomaly.toFixed(3)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {fraud ? (
                            <span className="rounded-full bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-400">
                              FRAUD
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-400/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                              NORMAL
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            onClick={() =>
                              router.push(`/transactions/${id}`)
                            }
                            className="rounded-lg border border-cyan-400/20 px-4 py-2 text-xs font-semibold text-cyan-400 transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
                          >
                            View Details
                          </button>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>
            )}

          </div>
        </section>

        {/* FOOTER INFO */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-cyan-500/20 bg-[#07131d] p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-400">
              Dataset Status
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Dashboard is using the currently uploaded dataset.
            </p>
          </div>

          <button
            onClick={loadTransactions}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 transition hover:border-cyan-400/30 hover:text-white"
          >
            Refresh Data
          </button>

        </div>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  type,
}: {
  title: string;
  value: number;
  subtitle: string;
  type: "blue" | "green" | "red";
}) {
  const styles = {
    blue: "border-blue-500/30 bg-blue-500/5",
    green: "border-green-500/30 bg-green-500/5",
    red: "border-red-500/30 bg-red-500/5",
  };

  const textStyles = {
    blue: "text-blue-400",
    green: "text-green-400",
    red: "text-red-400",
  };

  return (
    <div
      className={`rounded-2xl border p-6 ${styles[type]}`}
    >
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p className={`mt-3 text-3xl font-bold ${textStyles[type]}`}>
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-xs text-gray-600">
        {subtitle}
      </p>
    </div>
  );
}

