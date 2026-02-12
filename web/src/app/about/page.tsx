"use client";

import { motion } from "framer-motion";
import { Film, MapPin, Coffee, VolumeX } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black pt-32 pb-20">
      
      <div className="max-w-5xl mx-auto px-6">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <p className="text-yellow-500 font-mono text-sm tracking-widest uppercase mb-4">Est. 2024 • Nairobi</p>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8">
            NOT JUST A <br /> MOVIE THEATER.
          </h1>
          <div className="h-1 w-24 bg-yellow-500 mx-auto" />
        </motion.div>

        {/* SECTION 1: THE MISSION */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-yellow-500">We Believe in the Big Screen.</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              In an age of streaming on phones and laptops, the sacred ritual of the cinema has been lost. 
              The <span className="text-white font-bold">Falutin Family</span> is a reclamation of that space.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              We curate films that demand attention. From golden-age classics to avant-garde masterpieces, 
              every screening is an event designed to spark conversation, not just consumption.
            </p>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative aspect-square bg-neutral-900 rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700"
          >
             {/* Atmospheric Image */}
             <Image 
               src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop" 
               alt="Cinema interior"
               fill
               className="object-cover w-full h-full opacity-60 hover:opacity-100 transition-opacity"
             />
             <div className="absolute inset-0 border border-white/10 m-4 pointer-events-none" />
          </motion.div>
        </div>

        {/* SECTION 2: HOUSE RULES */}
        <div className="bg-neutral-900/30 p-8 md:p-16 rounded-3xl border border-white/5 mb-32">
          <h2 className="text-center text-3xl font-bold mb-16 uppercase tracking-widest text-white">House Rules</h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
             
             {/* Rule 1 */}
             <div className="group">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500 transition-colors">
                    <VolumeX className="w-8 h-8 text-white group-hover:text-black transition-colors" />
                </div>
                <h3 className="font-bold text-xl mb-3">Silence is Golden</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Respect the film. No phones, no texting, no whispering. Immerse yourself completely in the narrative.
                </p>
             </div>

             {/* Rule 2 */}
             <div className="group">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500 transition-colors">
                    <Coffee className="w-8 h-8 text-white group-hover:text-black transition-colors" />
                </div>
                <h3 className="font-bold text-xl mb-3">Social Intermission</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We encourage debate. Stay after the credits for drinks, deep dives, and arguments about the ending.
                </p>
             </div>

             {/* Rule 3 */}
             <div className="group">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500 transition-colors">
                    <MapPin className="w-8 h-8 text-white group-hover:text-black transition-colors" />
                </div>
                <h3 className="font-bold text-xl mb-3">Secret Locations</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our venue shifts like the plot. Keep your eyes on your ticket for the coordinates.
                </p>
             </div>

          </div>
        </div>

        {/* SECTION 3: FOOTER QUOTE */}
        <div className="text-center border-t border-white/10 pt-20">
            <Film className="w-12 h-12 text-yellow-500 mx-auto mb-6 opacity-50" />
            <blockquote className="text-2xl md:text-4xl font-serif italic text-gray-400 max-w-3xl mx-auto">
                &quot;Every time I go to a movie, it&apos;s magic, no matter what the movie&apos;s about.&quot;
            </blockquote>
            <cite className="block mt-6 text-sm font-bold uppercase tracking-widest not-italic text-gray-600">
                — Steven Spielberg
            </cite>
        </div>

      </div>
    </div>
  );
}