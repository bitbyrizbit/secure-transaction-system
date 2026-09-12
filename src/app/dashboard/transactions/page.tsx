"use client"
import { useState, useEffect } from "react";
import { createTransactionAction } from "@/app/actions/transaction";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setTransactions(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load transactions");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    const res = await createTransactionAction({
      amount: parseFloat(amount),
      type: type as any,
      description
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Transaction created successfully!");
      setTransactions([res.transaction, ...transactions] as any);
      setAmount("");
      setDescription("");
    }
    setSubmitting(false);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Transactions</h1>
      
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Transaction</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input required type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full border p-2 rounded">
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input type="text" value={description} onChange={e=>setDescription(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {submitting ? "Processing..." : "Submit Transaction"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-medium text-slate-600">ID</th>
              <th className="p-4 font-medium text-slate-600">Type</th>
              <th className="p-4 font-medium text-slate-600">Amount</th>
              <th className="p-4 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">No transactions found.</td></tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id}>
                  <td className="p-4 text-sm text-slate-600">{tx.id}</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">{tx.type}</span></td>
                  <td className="p-4 font-medium">${tx.amount}</td>
                  <td className="p-4 text-sm text-slate-500">{tx.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
