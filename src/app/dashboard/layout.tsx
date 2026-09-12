"use client"
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return <div className="p-8">Loading session...</div>;
  if (!session) { 
    if (typeof window !== "undefined") router.push("/login"); 
    return null; 
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-black">
      <nav className="w-64 bg-white border-r p-6 space-y-6">
        <h2 className="font-bold text-2xl tracking-tight text-slate-800">SecureTx</h2>
        <div className="flex flex-col space-y-3 font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Overview</Link>
          <Link href="/dashboard/transactions" className="hover:text-blue-600 transition-colors">Transactions</Link>
          <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin Panel</Link>
          <button onClick={async () => { await signOut(); router.push("/login"); }} className="text-left text-red-500 hover:text-red-700 transition-colors pt-4 border-t mt-4">Log out</button>
        </div>
      </nav>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
