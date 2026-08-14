"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid admin credentials.");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Cannot connect to FraudShield backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b14] p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1424] p-8 shadow-2xl">

        <div className="text-center">
          <div className="text-5xl">🛡️</div>

          <h1 className="mt-4 text-3xl font-bold">
            Fraud<span className="text-cyan-400">Shield</span>
          </h1>

          <p className="mt-2 text-gray-400">
            Administrator Portal
          </p>
        </div>

        <div className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Admin Email
            </label>

            <input
              type="email"
              placeholder="admin@fraudshield.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
              className="w-full rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 p-4 font-bold text-black hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Panel →"}
          </button>

        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          FraudShield Security Console
        </p>

      </div>
    </main>
  );
}