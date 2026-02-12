"use client";

import { useEffect, useState, useRef } from "react";
import { createClient, type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, Film, CheckCircle, Share2, Copy, LayoutDashboard, 
  MessageSquare, Image as ImageIcon, Home, Send, VenetianMask,
  CreditCard, Trophy, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

// --- CONFIG ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const POLL_OPTIONS = [
  { id: "pulp_fiction", title: "Pulp Fiction", year: "1994", genre: "Crime/Drama" },
  { id: "spirited_away", title: "Spirited Away", year: "2001", genre: "Animation" },
  { id: "oldboy", title: "Oldboy", year: "2003", genre: "Neo-noir Thriller" },
];

// --- TYPES ---
type ViewState = 'dashboard' | 'discussion' | 'gallery';
interface Message {
  id: number;
  content: string;
  persona_name: string | null;
  persona_color: string | null;
  user_id: string;
  created_at: string;
}

export default function MemberLounge() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');

  // --- DASHBOARD STATE ---
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [voteLoading, setVoteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- DISCUSSION STATE ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isPersonaMode, setIsPersonaMode] = useState(false); 
  const [personaName, setPersonaName] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. INITIALIZATION
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: vote } = await supabase.from("votes").select("*").eq("user_id", user.id).single();
      if (vote) { setHasVoted(true); setSelectedMovie(vote.movie_choice); }

      const { data: msgs } = await supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(50);
      if (msgs) setMessages(msgs);

      const channel = supabase.channel('realtime_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
        .subscribe();

      setLoading(false);
      return () => { supabase.removeChannel(channel); };
    }
    init();
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeView]);

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 4);
    targetDate.setHours(targetDate.getHours() + 12);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) clearInterval(interval);
      else setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };
  
  const handleVote = async (movieTitle: string) => {
    if (!user) return;
    setVoteLoading(true);
    try {
      const { error } = await supabase.from("votes").insert([{ user_id: user.id, movie_choice: movieTitle }]);
      if (error) throw error;
      setHasVoted(true); setSelectedMovie(movieTitle);
    } catch { alert("You have already voted!"); } 
    finally { setVoteLoading(false); }
  };

  const copyCode = () => {
    const code = `FAL-${user?.id.slice(0, 4).toUpperCase()}-VIP`;
    navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    if (isPersonaMode && !personaName) {
      alert("Please enter an Alias first!");
      return;
    }

    const payload = {
      user_id: user.id,
      content: newMessage,
      persona_name: isPersonaMode ? personaName : null,
      persona_color: isPersonaMode ? "yellow" : null,
    };

    await supabase.from("messages").insert([payload]);
    setNewMessage("");
  };

  const pad = (num: number) => String(num).padStart(2, '0');

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Authenticating...</div>;

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-20 md:w-64 shrink-0 border-r border-white/10 bg-neutral-900/50 flex flex-col justify-between backdrop-blur-md z-50">
        <div>
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3">
             <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold font-mono">F</span>
             </div>
             <span className="font-bold tracking-widest hidden md:block">FALUTIN</span>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-2 mt-4">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden md:block">Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveView('discussion')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeView === 'discussion' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden md:block">Discussion</span>
            </button>

            <button 
              onClick={() => setActiveView('gallery')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeView === 'gallery' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="hidden md:block">Gallery</span>
            </button>
            
            <div className="h-px bg-white/10 my-4 mx-4" />

            {/* External Links */}
            <Link href="/" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <Home className="w-5 h-5" />
              <span className="hidden md:block">Main Site</span>
            </Link>
            
            <Link href="/archive" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <Film className="w-5 h-5" />
              <span className="hidden md:block">Archives</span>
            </Link>
          </nav>
        </div>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-900/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="hidden md:block text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto relative bg-neutral-950">
        <div className="p-6 md:p-12 max-w-6xl mx-auto">
          
          {/* VIEW: DASHBOARD */}
          {activeView === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               
               {/* HEADER REMOVED: Direct to content */}
               
               {/* Grid Layout */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* FEATURE 1: DIGITAL PASS */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-yellow-500 w-5 h-5" />
                        <h2 className="text-xl font-bold">Your Digital Pass</h2>
                      </div>
                      
                      <div className="relative w-full aspect-[1.586] rounded-2xl overflow-hidden shadow-2xl group">
                          <div className="absolute inset-0 bg-linear-to-br from-yellow-300 via-yellow-600 to-yellow-800" />
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
                          <div className="relative z-10 h-full p-8 flex flex-col justify-between text-black">
                              <div className="flex justify-between items-start">
                                  <Film className="w-8 h-8 opacity-80" />
                                  <span className="text-xs font-bold border border-black/30 px-3 py-1 rounded uppercase tracking-widest backdrop-blur-sm">VIP Access</span>
                              </div>
                              <div>
                                  <p className="text-[10px] uppercase tracking-widest opacity-60">Member Name</p>
                                  <p className="text-2xl md:text-3xl font-bold font-mono tracking-tight uppercase truncate">{user?.user_metadata?.full_name}</p>
                              </div>
                              <div className="flex justify-between items-end">
                                  <div>
                                      <p className="text-[10px] uppercase tracking-widest opacity-60">Member ID</p>
                                      <p className="text-xs font-mono">{user?.id.slice(0, 8)}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] uppercase tracking-widest opacity-60">Status</p>
                                      <p className="text-xs font-bold">LIFETIME</p>
                                  </div>
                              </div>
                          </div>
                          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/40 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                  </div>

                  {/* FEATURE 2: VOTING */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-2">
                          <Trophy className="text-yellow-500 w-5 h-5" />
                          <h2 className="text-xl font-bold">Curate the Screen</h2>
                      </div>

                      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
                          <div className="space-y-3">
                              {POLL_OPTIONS.map((movie) => (
                                  <button
                                      key={movie.id}
                                      onClick={() => handleVote(movie.title)}
                                      disabled={hasVoted || voteLoading}
                                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMovie === movie.title ? "bg-yellow-500 border-yellow-500 text-black" : "bg-black border-white/10 hover:border-yellow-500/50"}`}
                                  >
                                      <span className="font-bold">{movie.title}</span>
                                      {selectedMovie === movie.title ? (
                                        <CheckCircle className="w-5 h-5" />
                                      ) : (
                                        !hasVoted && <div className="w-5 h-5 rounded-full border border-white/20" />
                                      )}
                                  </button>
                              ))}
                          </div>
                          {hasVoted && (
                              <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-6 text-center text-xs text-yellow-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                              >
                                  <Sparkles className="w-4 h-4" /> Vote Confirmed
                              </motion.div>
                          )}
                      </div>
                  </div>
               </div>

               {/* Classified Section */}
               <div className="border-t border-white/10 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Secret Event */}
                  <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1')] bg-cover opacity-20 group-hover:opacity-30 transition-opacity grayscale"></div>
                      <div className="relative z-10 text-center">
                          <div className="inline-block bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded mb-4 animate-pulse">CLASSIFIED</div>
                          <h3 className="text-4xl font-black tracking-tighter mb-4">PROJECT <span className="bg-white text-black px-2">REDACTED</span></h3>
                          <div className="flex justify-center gap-4 font-mono text-yellow-500 text-2xl font-bold mb-6">
                              <div>{pad(timeLeft.days)}<span className="text-[10px] block text-gray-500">DAYS</span></div> :
                              <div>{pad(timeLeft.hours)}<span className="text-[10px] block text-gray-500">HRS</span></div> :
                              <div>{pad(timeLeft.minutes)}<span className="text-[10px] block text-gray-500">MIN</span></div> :
                              <div>{pad(timeLeft.seconds)}<span className="text-[10px] block text-gray-500">SEC</span></div>
                          </div>
                      </div>
                  </div>

                  {/* Invite Code */}
                  <div className="bg-linear-to-b from-neutral-900 to-black border border-white/10 rounded-2xl p-8 text-center flex flex-col justify-center">
                      <Share2 className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                      <h3 className="font-bold mb-4">Invite a Friend</h3>
                      <div className="bg-black border border-white/20 p-4 rounded-xl flex justify-between items-center">
                          <code className="text-yellow-500 font-mono font-bold">FAL-{user?.id.slice(0,4).toUpperCase()}</code>
                          <button onClick={copyCode}><Copy className={`w-5 h-5 ${copied ? "text-green-500" : "text-gray-400"}`} /></button>
                      </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* VIEW: DISCUSSION BOARD */}
          {activeView === 'discussion' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-6rem)] flex flex-col">
              
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tighter">THE <span className="text-yellow-500">FORUM</span></h1>
                <div className="flex gap-2 items-center bg-neutral-900 p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => setIsPersonaMode(false)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${!isPersonaMode ? 'bg-white text-black' : 'text-gray-400'}`}
                  >
                    Real ID
                  </button>
                  <button 
                    onClick={() => setIsPersonaMode(true)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-2 ${isPersonaMode ? 'bg-yellow-500 text-black' : 'text-gray-400'}`}
                  >
                    <VenetianMask className="w-3 h-3" /> Persona
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-neutral-900/50 border border-white/10 rounded-2xl p-6 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-20">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No messages yet. Start the conversation.</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.user_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.persona_name ? 'text-yellow-500' : 'text-gray-400'}`}>
                          {msg.persona_name || "Member"}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isMe ? 'bg-white text-black rounded-tr-none' : 'bg-neutral-800 text-gray-200 rounded-tl-none border border-white/5'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Persona Setup (If mode active but not set) */}
              {isPersonaMode && !personaName && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-4 flex items-center gap-4">
                  <VenetianMask className="w-6 h-6 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-500 font-bold mb-1">Go Incognito</p>
                    <input 
                      type="text" 
                      placeholder="Enter your Alias..." 
                      className="bg-black border border-white/10 rounded px-3 py-1 text-sm w-full focus:border-yellow-500 outline-none"
                      onChange={(e) => setPersonaName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isPersonaMode ? `Speaking as ${personaName || "Anonymous"}...` : "Type a message..."}
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-6 py-4 focus:border-yellow-500 outline-none transition-all"
                />
                <button type="submit" className="bg-white text-black rounded-xl px-6 hover:bg-yellow-500 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </form>

            </motion.div>
          )}

          {/* VIEW: GALLERY (Placeholder) */}
          {activeView === 'gallery' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
               <ImageIcon className="w-20 h-20 text-gray-800 mx-auto mb-6" />
               <h2 className="text-2xl font-bold text-gray-500">The Vault is Locked</h2>
               <p className="text-gray-600 mt-2">Event photos will be uploaded here after the next screening.</p>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}