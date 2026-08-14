"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  name: string;
  status: string;
};

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    try {
      const response = await fetch(
        "http://localhost:8000/admin/users",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!data.authenticated) {
        router.replace("/admin");
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("Users error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function addUser() {
    setMessage("");

    if (!name.trim() || !email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/admin/users",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Unable to create user.");
        return;
      }

      setMessage("User created successfully.");
      setName("");
      setEmail("");

      await loadUsers();
    } catch (error) {
      console.error("Create user error:", error);
      setMessage("Backend connection failed.");
    }
  }

  async function toggleStatus(id: number) {
    try {
      const response = await fetch(
        `http://localhost:8000/admin/users/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Unable to update status.");
        return;
      }

      await loadUsers();
    } catch (error) {
      console.error("Status update error:", error);
    }
  }

  const activeUsers = users.filter(
    (user) => user.status === "active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "inactive"
  ).length;

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
          <p className="text-sm text-cyan-400">
            ADMINISTRATION
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            User Management
          </h1>

          <p className="mt-2 text-gray-400">
            Manage FraudShield platform users.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Total Users
            </p>

            <p className="mt-3 text-3xl font-bold">
              {users.length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Active Users
            </p>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {activeUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-[#0d1424] p-6">
            <p className="text-gray-400">
              Inactive Users
            </p>

            <p className="mt-3 text-3xl font-bold text-red-400">
              {inactiveUsers}
            </p>
          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0d1424] p-7">

          <h2 className="text-xl font-semibold">
            Add New User
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="rounded-xl border border-white/10 bg-[#070b14] p-4 outline-none focus:border-cyan-400"
            />

            <button
              onClick={addUser}
              className="rounded-xl bg-cyan-500 p-4 font-bold text-black transition hover:bg-cyan-400"
            >
              + Add User
            </button>

          </div>

          {message && (
            <p className="mt-4 text-sm text-cyan-400">
              {message}
            </p>
          )}

        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1424]">

          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-semibold">
              Platform Users
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No users found.
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left">

              <thead className="border-b border-white/10 text-sm text-gray-500">
                <tr>
                  <th className="p-5">ID</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >

                    <td className="p-5 text-gray-400">
                      #{user.id}
                    </td>

                    <td className="p-5 font-semibold">
                      {user.name}
                    </td>

                    <td className="p-5 text-gray-400">
                      {user.email}
                    </td>

                    <td className="p-5">

                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          user.status === "active"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        ● {user.status}
                      </span>

                    </td>

                    <td className="p-5">

                      <button
                        onClick={() => toggleStatus(user.id)}
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:border-cyan-400 hover:text-cyan-400"
                      >
                        Toggle Status
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>

    </main>
  );
}