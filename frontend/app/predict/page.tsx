"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Prediction = {
  fraud_probability: number;
  risk_level: string;
};

export default function PredictPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [anomalyScore, setAnomalyScore] = useState("");
  const [hour, setHour] = useState("12");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [category, setCategory] = useState("Food");

  const [prediction, setPrediction] =
    useState<Prediction | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function predictFraud() {
    setError("");
    setPrediction(null);

    const amountValue = Number.parseFloat(amount);
    const transactionAmountValue =
      Number.parseFloat(transactionAmount);
    const anomalyScoreValue =
      Number.parseFloat(anomalyScore);
    const hourValue = Number.parseInt(hour);
    const dayValue = Number.parseInt(dayOfWeek);

    if (
      !Number.isFinite(amountValue) ||
      !Number.isFinite(transactionAmountValue) ||
      !Number.isFinite(anomalyScoreValue)
    ) {
      setError(
        "Please enter valid values for amount, transaction amount and anomaly score."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountValue,
            transaction_amount:
              transactionAmountValue,
            anomaly_score: anomalyScoreValue,
            hour: hourValue,
            day_of_week: dayValue,
            category: category,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Prediction failed"
        );
      }

      setPrediction(data.prediction);
    } catch (err: any) {
      setError(
        err.message ||
          "Unable to connect to FraudShield API."
      );
    } finally {
      setLoading(false);
    }
  }

  const isFraud =
    prediction?.risk_level?.toUpperCase() === "FRAUD";

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white md:p-10">

      <div className="mx-auto max-w-5xl">

        <button
          onClick={() =>
            router.push("/")
          }
          className="mb-6 text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold text-cyan-400">
            AI FRAUD DETECTION
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Transaction Risk Analyzer
          </h1>

          <p className="mt-2 text-gray-400">
            Analyze a transaction using the FraudShield
            machine learning engine.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-7">

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="500"
                className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Transaction Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={transactionAmount}
                onChange={(e) =>
                  setTransactionAmount(
                    e.target.value
                  )
                }
                placeholder="500"
                className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Anomaly Score
              </label>

              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={anomalyScore}
                onChange={(e) =>
                  setAnomalyScore(
                    e.target.value
                  )
                }
                placeholder="0.25"
                className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
              />

              <p className="mt-1 text-xs text-gray-600">
                Enter a value between 0 and 1.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Hour
              </label>

              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) =>
                  setHour(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Day of Week
              </label>

              <input
                type="number"
                min="0"
                max="6"
                value={dayOfWeek}
                onChange={(e) =>
                  setDayOfWeek(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
              />

              <p className="mt-1 text-xs text-gray-600">
                0 = Sunday, 6 = Saturday.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
              >
                <option value="Food">Food</option>
                <option value="Online">Online</option>
                <option value="Other">Other</option>
                <option value="Retail">Retail</option>
                <option value="Travel">Travel</option>
              </select>
            </div>

          </div>

          <button
            onClick={predictFraud}
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-cyan-500 p-4 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Analyzing Transaction..."
              : "Analyze Transaction →"}
          </button>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
              {error}
            </div>
          )}

          {prediction && (
            <div
              className={`mt-7 rounded-2xl border p-7 ${
                isFraud
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-green-500/30 bg-green-500/5"
              }`}
            >

              <p className="text-sm text-cyan-400">
                AI ANALYSIS RESULT
              </p>

              <div className="mt-5 flex flex-col items-center justify-center text-center">

                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl ${
                    isFraud
                      ? "bg-red-500/10"
                      : "bg-green-500/10"
                  }`}
                >
                  {isFraud ? "🚨" : "🛡️"}
                </div>

                <h2
                  className={`mt-5 text-3xl font-bold ${
                    isFraud
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {prediction.risk_level}
                </h2>

                <p className="mt-2 text-gray-400">
                  Fraud Probability
                </p>

                <p className="mt-1 text-5xl font-bold">
                  {(
                    Number(
                      prediction.fraud_probability
                    ) * 100
                  ).toFixed(1)}
                  %
                </p>

              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-[#070b14] p-4 text-center">
                  <p className="text-xs text-gray-500">
                    AMOUNT
                  </p>
                  <p className="mt-2 font-semibold">
                    ₹{amountValue(amount)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#070b14] p-4 text-center">
                  <p className="text-xs text-gray-500">
                    CATEGORY
                  </p>
                  <p className="mt-2 font-semibold">
                    {category}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#070b14] p-4 text-center">
                  <p className="text-xs text-gray-500">
                    ANOMALY SCORE
                  </p>
                  <p className="mt-2 font-semibold">
                    {anomalyScore}
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </main>
  );
}

function amountValue(value: string) {
  const number = Number.parseFloat(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}