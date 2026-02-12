"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { urlFor, type Screening } from "@/lib/sanity";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MovieCard({ screening }: { screening: Screening }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group bg-neutral-900/50 rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all duration-300">
      
      {/* 1. CLICKABLE POSTER */}
      <Link href={`/book/${screening._id}`} className="block relative aspect-video w-full overflow-hidden">
        {screening.movie.poster && (
          <Image
            src={urlFor(screening.movie.poster).url()}
            alt={screening.movie.title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            style={{ objectPosition: "center 20%" }} 
          />
        )}
        <div className="absolute bottom-3 left-3 bg-yellow-500 text-black font-bold font-mono text-[10px] px-2 py-1 uppercase tracking-widest">
          {format(new Date(screening.date), "MMM dd • HH:mm")}
        </div>
      </Link>

      {/* 2. TEXT CONTENT */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <Link href={`/book/${screening._id}`}>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors cursor-pointer">
              {screening.movie.title}
            </h3>
          </Link>
          <span className="font-mono text-yellow-500 text-sm whitespace-nowrap">
            KES {screening.price}
          </span>
        </div>

        {/* 3. EXPANDABLE SYNOPSIS */}
        <div className="relative">
          <p className={`text-gray-400 text-xs leading-relaxed transition-all duration-300 ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}>
            {screening.movie.description}
          </p>
          
          <button 
            onClick={(e) => {
              e.preventDefault(); 
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-yellow-500 mt-2 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <>Read Less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Read More <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>

        {/* 4. BOOK BUTTON */}
        <Link 
            href={`/book/${screening._id}`}
            className="mt-4 block w-full text-center py-2 border border-white/10 rounded hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase tracking-widest"
        >
            Get Tickets
        </Link>
      </div>
    </div>
  );
}