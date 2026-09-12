"use client"
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Overview</h1>
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {session?.user?.name}</h2>
        <div className="space-y-2 text-slate-600">
          <p><strong>Email:</strong> {session?.user?.email}</p>
          <p><strong>Session ID:</strong> {session?.session?.id}</p>
        </div>
      </div>
    </div>
  )
}
