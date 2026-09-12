"use client"
import { signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signUp.email({ email, password, name });
    if (error) setError(error.message || "Signup failed");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSignup} className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input className="border w-full p-2 mb-4" type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="border w-full p-2 mb-4" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="border w-full p-2 mb-4" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="bg-blue-600 text-white w-full p-2 rounded" type="submit">Sign Up</button>
      </form>
    </div>
  )
}
