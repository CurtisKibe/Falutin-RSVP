"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, Loader2, Sparkles } from "lucide-react";

// --- CONFIG ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); 

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/members"); 
      } else {
        // --- SIGN UP LOGIC ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }, 
          },
        });
        if (error) throw error;
        alert("Welcome to the family! You can now log in.");
        setIsLogin(true); 
      }
    } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      
      {/* LEFT SIDE: VISUALS */}
      <div className="hidden md:flex w-1/2 bg-neutral-900 relative items-center justify-center overflow-hidden">
        {/* Background Image/Video Placeholder */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/50" />
        
        <div className="relative z-10 text-center p-12">
            <h1 className="text-5xl font-bold mb-4 tracking-tighter">THE <span className="text-yellow-500">INNER</span> CIRCLE</h1>
            <p className="text-gray-400 max-w-md mx-auto text-lg">
                Unlock secret screenings, member-only discussions, and priority booking.
            </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        {/* Back Button */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Cinema
        </Link>

        <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-3xl font-bold mb-2">{isLogin ? "Welcome Back" : "Join the Family"} </h2>
                <p className="text-gray-400 text-sm">
                    {isLogin ? "Enter your credentials to access the lounge." : "Create an account to start your journey."}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
                
                {/* Full Name (Sign Up Only) */}
                {!isLogin && (
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>
                )}

                {/* Email */}
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-5 h-5" />
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                    />
                </div>

                {/* Password */}
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-5 h-5" />
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {isLogin ? "Unlock Access" : "Become a Member"}
                            {!isLogin && <Sparkles className="w-4 h-4" />}
                        </>
                    )}
                </button>
            </form>

            {/* Toggle */}
            <div className="mt-8 text-center text-sm text-gray-500">
                {isLogin ? "Not a member yet?" : "Already have an account?"}{" "}
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white font-bold hover:text-yellow-500 transition-colors underline decoration-yellow-500/50 hover:decoration-yellow-500"
                >
                    {isLogin ? "Apply for Membership" : "Sign In"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}