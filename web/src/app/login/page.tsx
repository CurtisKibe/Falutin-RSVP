"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { Mail, Lock, User, Loader2, Sparkles, Clapperboard } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); 

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Session Check
        const { data: { session } } = await supabase.auth.getSession();
        const userRole = session?.user?.user_metadata?.role;
        
        console.log("Logged in as:", userRole);

        // Hard redirect to clear any cached states
        if (userRole === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/members";
        }

      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: fullName,
              role: "member" 
            }, 
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative">
      
      {/* "FALUTIN FAM" Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-yellow-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold group"
      >
        <Clapperboard className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
        FALUTIN FAM
      </Link>

      {/* Centered, Minimalist Form Card */}
      <div className="w-full max-w-md bg-neutral-900/80 border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-md mt-16 md:mt-0">
        
        <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-2 text-white">
                {isLogin ? "Welcome Back" : "Join the Family"}
            </h2>
            <p className="text-gray-400 text-sm">
                {isLogin ? "Enter your credentials to access the lounge." : "Create an account to start your journey."}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                    />
                </div>
            )}

            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-5 h-5" />
                <input 
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                />
            </div>

            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-5 h-5" />
                <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
  );
}