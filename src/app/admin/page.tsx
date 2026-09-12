import { getTenantContext } from "@/lib/tenant";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  let ctx;
  try {
    ctx = await getTenantContext();
  } catch {
    redirect("/login");
  }

  // Phase 8 & 9: Strict Role Check
  if (ctx.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Forbidden</h1>
          <p className="text-slate-600 mb-6">You are not authorized to view the admin panel.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    )
  }

  const [users, txs, audits, events] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.auditLog.count(),
    prisma.emailEvent.count()
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto text-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">Back to App</Link>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{users}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold">{txs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Audit Logs</h3>
          <p className="text-3xl font-bold">{audits}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Email Events</h3>
          <p className="text-3xl font-bold">{events}</p>
        </div>
      </div>
    </div>
  )
}
