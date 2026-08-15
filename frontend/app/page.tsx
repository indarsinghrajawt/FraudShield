"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-[#050814] text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
        <p className="mt-4 text-sm text-gray-500">
          Loading FraudShield...
        </p>
      </div>
    </main>
  ),
});

export default function Home() {
  return <Dashboard />;
}
