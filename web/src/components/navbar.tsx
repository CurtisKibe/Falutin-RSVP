"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Lock } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-md border-b border-white/10 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white z-50">
          FALUTIN <span className="text-yellow-500">FAM</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            HOME
          </Link>
          <Link href="/archive" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            ARCHIVE
          </Link>
          <Link href="/gallery" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            GALLERY
          </Link>

          {/* LINK TO LOGIN */}
          <Link href="/login">
            <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-yellow-500 transition-colors">
              <Lock className="w-3 h-3" /> Member Access
            </button>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white z-50">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-8 z-40">
          <Link onClick={() => setIsOpen(false)} href="/" className="text-2xl font-bold text-white hover:text-yellow-500">
            HOME
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/archive" className="text-2xl font-bold text-white hover:text-yellow-500">
            ARCHIVE
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/gallery" className="text-2xl font-bold text-white hover:text-yellow-500">
            GALLERY
          </Link>
          
          <Link onClick={() => setIsOpen(false)} href="/login">
            <button className="flex items-center gap-2 bg-yellow-500 text-black px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest">
              <Lock className="w-4 h-4" /> Member Login
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}