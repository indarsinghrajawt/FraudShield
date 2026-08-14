"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
      <p className="text-gray-400">
        Opening FraudShield Dashboard...
      </p>
    </main>
  );
}