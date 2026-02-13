"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion"; 
import { ArrowRight, Mail, Lock } from "lucide-react";
import { client } from "@/lib/sanity";
import MovieCard from "@/components/moviecard";

// --- TYPE DEFINITIONS ---
interface Screening {
  _id: string;
  date: string;
  price: number;
  locationName?: string;
  movie: {
    title: string;
    poster: object;
    description: string;
  };
}

export default function HomePage() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING (Optimized) ---
  useEffect(() => {
    async function fetchData() {
      const query = `*[_type == "screening" && date > now()] | order(date asc) {
        _id, date, price, locationName,
        movie->{ title, poster, description }
      }`;
      
      // 👇 UPDATED: Added caching options for better performance
      const data = await client.fetch(query, {}, {
        next: { revalidate: 60 } // Checks for new data every 60s
      });
      
      setScreenings(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* --- HERO SECTION (With Video & Member Button) --- */}
      <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        
        {/* Video Layer */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 h-full w-full object-cover opacity-50"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Content Layer */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-6"
          >
            THE FALUTIN <br /> <span className="text-yellow-500">FAMILY</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-xl mx-auto text-lg text-gray-200 mb-10"
          >
            Cinema. Conversation. Community. <br />
            Join us for exclusive screenings and deep dives into the themes within the films.
          </motion.p>

          {/* BUTTONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* Button 1: Scroll to Screenings */}
            <Link 
              href="/archive"
              className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition-all uppercase tracking-widest text-sm"
            >
              Reserve Your Spot
            </Link>
            
            {/* Button 2: MEMBER LOGIN */}
            <Link href="/login">
                <button 
                  className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all uppercase tracking-widest text-sm"
                >
                  Become a Member
                </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* --- UPCOMING SCREENINGS --- */}
      <section id="upcoming" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Upcoming Screenings</h2>
            <p className="text-gray-400 font-mono text-sm">RESERVE YOUR TICKETS</p>
          </div>
          
          <Link 
            href="/archive" 
            className="hidden md:flex items-center text-yellow-500 hover:text-white transition gap-2 text-sm font-bold uppercase tracking-widest"
          >
            View Past Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             <div className="col-span-full py-20 text-center text-gray-500">Loading schedules...</div>
          ) : screenings.length > 0 ? (
            screenings.map((screening) => (
              <MovieCard key={screening._id} screening={screening} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl bg-neutral-900/50">
              <p className="text-xl text-gray-500 mb-4">No upcoming screenings scheduled.</p>
              <Link href="/archive" className="text-yellow-500 hover:underline">
                Check out the Archives →
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Archive Link */}
        <div className="mt-8 md:hidden text-center">
            <Link href="/archive" className="inline-flex items-center text-yellow-500 gap-2 font-bold uppercase tracking-widest text-sm">
                View Past Events <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </section>

      {/* --- NEWSLETTER --- */}
      <section className="py-24 bg-neutral-900 border-t border-white/10">
        <div className="max-w-xl mx-auto px-6 text-center">
          <Mail className="w-10 h-10 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-white">Join the Family</h2>
          <p className="text-gray-400 mb-8">
            Get early access to tickets and secret screening announcements.
          </p>
          <form className="flex flex-col md:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-black border border-white/20 text-white px-6 py-4 rounded-lg focus:border-yellow-500 outline-none placeholder:text-gray-700 transition-colors"
            />
            <button className="bg-white text-black font-bold px-8 py-4 rounded-lg hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-yellow-500/20">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-10 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} The Falutin Family. All rights reserved.
            </p>
            {/* ADMIN LINK */}
            <Link href="/admin/login" className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-yellow-500 transition-colors uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Admin Access
            </Link>
        </div>
      </footer>
    </div>
  );
}