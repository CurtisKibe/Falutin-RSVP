"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  const videoSrc = "/hero.mp4"; 

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* 1. BACKGROUND VIDEO LAYER */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 h-full w-full object-cover opacity-50"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* 2. OVERLAY GRADIENT */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

      {/* 3. CONTENT LAYER */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        
        {/* Animated Headline */}
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
          className="max-w-xl text-lg text-gray-200 mb-8"
        >
          Cinema. Conversation. Community. <br />
          Join us for exclusive screenings and deep dives into the themes within the films.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Button 1: Book Spot */}
          <Link 
            href="#upcoming"
            className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition-all uppercase tracking-widest text-sm"
          >
            Reserve Your Spot
          </Link>
          
          {/* Button 2: Become a Member */}
          <button 
            className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all uppercase tracking-widest text-sm"
          >
            Become a Member
          </button>
        </motion.div>
      </div>
    </div>
  );
}