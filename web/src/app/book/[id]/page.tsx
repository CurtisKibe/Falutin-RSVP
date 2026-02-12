"use client";

import { useState, useEffect, useRef } from "react";
import { client, urlFor } from "@/lib/sanity";
import Image from "next/image";
import { useParams } from "next/navigation"; 
import { format } from "date-fns";
import { CheckCircle, Ticket, Play, Minus, Plus } from "lucide-react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

// 1. TYPE DEFINITIONS
interface ScreeningDetail {
  _id: string;
  date: string;
  price: number;
  locationName?: string;
  location?: { lat: number; lng: number };
  movie: {
    title: string;
    poster: object; 
    description: string;
    themes?: string[];
    trailer?: string;
  };
}

function getYoutubeId(url: string | undefined) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function BookingPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState<ScreeningDetail | null>(null);
  
  // FORM STATE
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tickets, setTickets] = useState(1);
  
  const [status, setStatus] = useState("idle");
  const [checkoutId, setCheckoutId] = useState("");
  const ticketRef = useRef<HTMLDivElement>(null);

  // 2. FETCHES DATA
  useEffect(() => {
    async function fetchData() {
      const query = `*[_type == "screening" && _id == $id][0]{
        _id, date, price,
        locationName, location,
        movie->{ title, poster, description, themes, trailer }
      }`;
      const data = await client.fetch(query, { id });
      setScreening(data);
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  // 3. POLLING LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "processing" && checkoutId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-status/${checkoutId}`);
          
          if (res.ok) {
              const data = await res.json();
              if (data.status === "paid") {
                setStatus("paid"); 
                clearInterval(interval);
              } else if (data.status === "failed") {
                setStatus("error");
                clearInterval(interval);
              }
          }
        } catch (e) { 
            console.error("Polling Network Error", e); 
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, checkoutId]);

// --- 4. DOWNLOAD TICKET LOGIC ---
  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    
    try {
      
      const dataUrl = await toPng(ticketRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff', 
        pixelRatio: 2 
      });
      
      const link = document.createElement("a");
      link.download = `ticket-${screening?.movie.title}-${checkoutId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Ticket Download Error:", err);
      alert("Could not generate ticket. Please screenshot this screen instead.");
    }
  };

  // 5. PAYMENT HANDLER
  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!screening) return; 

    setStatus("processing");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,         
          phone: phone,
          email: email, 
          tickets: tickets,
          amount: screening.price, 
          screening_id: screening._id
        }),
      });

      const data = await res.json();
      if (data.status === "success") setCheckoutId(data.checkout_id);
      else setStatus("error");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  // TICKET COUNTER HANDLERS
  const incrementTickets = () => setTickets(prev => Math.min(prev + 1, 3)); 
  const decrementTickets = () => setTickets(prev => Math.max(prev - 1, 1)); 

  if (loading) return <div className="text-white text-center pt-32">Loading...</div>;
  if (!screening) return <div className="text-white text-center pt-32">Event not found.</div>;

  // --- VIEW 1: SUCCESS TICKET ---
  if (status === "paid") {
     return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
           <div ref={ticketRef} className="w-full max-w-md bg-white text-black rounded-3xl overflow-hidden mb-8">
               <div className="p-6 bg-yellow-500 text-center">
                   <h1 className="text-3xl font-bold uppercase tracking-wider">Admit {tickets}</h1>
                   <p className="font-mono text-sm opacity-80 uppercase">{name}</p>
               </div>
               <div className="p-8 text-center space-y-4">
                   <h2 className="text-2xl font-bold">{screening.movie.title}</h2>
                   <p className="text-gray-500">{format(new Date(screening.date), "PPP p")}</p>
                   <div className="flex justify-center my-4">
                        <QRCode value={checkoutId} size={120} />
                   </div>
                   <p className="text-xs text-gray-400 font-mono">ID: {checkoutId}</p>
               </div>
           </div>
           
           <button onClick={downloadTicket} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-500 transition-colors">
               Download Ticket
           </button>
        </div>
     )
  }

  // --- VIEW 2: SPLIT LAYOUT BOOKING PAGE ---
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* --- LEFT COLUMN: MOVIE DETAILS --- */}
        <div className="space-y-8">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {screening.movie.poster && (
                    <Image
                        src={urlFor(screening.movie.poster).url()}
                        alt={screening.movie.title}
                        fill
                        className="object-cover"
                        style={{ objectPosition: "center 20%" }} 
                    />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                     <Play className="w-16 h-16 text-white/80 border-4 border-white/80 rounded-full p-4 backdrop-blur-sm" />
                </div>
            </div>

            <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tighter">{screening.movie.title}</h1>
                <p className="text-yellow-500 font-mono text-lg">
                    {format(new Date(screening.date), "PPP 'at' p")}
                </p>
            </div>

            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Synopsis</h3>
                <p className="text-gray-300 leading-relaxed text-lg border-l-2 border-yellow-500 pl-4">
                    {screening.movie.description}
                </p>
            </div>

            {screening.movie.themes && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Themes</h3>
                    <div className="flex flex-wrap gap-2">
                        {screening.movie.themes.map((theme, i) => (
                            <span key={i} className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-full text-xs uppercase tracking-wide text-gray-300 hover:border-yellow-500 transition-colors cursor-default">
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {getYoutubeId(screening.movie.trailer) && (
                <div className="pt-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Official Trailer</h3>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                        <iframe
                            src={`https://www.youtube.com/embed/${getYoutubeId(screening.movie.trailer)}`}
                            title="Trailer"
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>


        {/* --- RIGHT COLUMN: BOOKING FORM --- */}
        <div className="relative">
            <div className="lg:sticky lg:top-32 bg-neutral-900/50 p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
                
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <Ticket className="text-yellow-500 w-6 h-6" /> Secure Your Spot
                </h2>

                {status === "processing" ? (
                   <div className="text-center py-20 animate-pulse">
                      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-6 animate-spin"></div>
                      <h3 className="text-xl font-bold text-white">Check your Phone</h3>
                      <p className="text-gray-400 mt-2 text-sm">Enter M-Pesa PIN for <span className="text-yellow-500">KES {screening.price * tickets}</span></p>
                      <p className="text-gray-600 text-xs mt-8">Do not close this window.</p>
                   </div>
                ) : (
                   <form onSubmit={handlePayment} className="space-y-6">
                       
                       {/* Name Input */}
                       <div>
                           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                           <input 
                               type="text" 
                               placeholder="e.g. Quentin Tarantino"
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                               className="w-full bg-black border border-white/10 rounded-lg p-4 text-white focus:border-yellow-500 outline-none placeholder:text-gray-700 transition-colors"
                               required
                           />
                       </div>

                       {/* Contact Info Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                               <input 
                                   type="text" 
                                   placeholder="2547..."
                                   value={phone}
                                   onChange={(e) => setPhone(e.target.value)}
                                   className="w-full bg-black border border-white/10 rounded-lg p-4 text-white focus:border-yellow-500 outline-none placeholder:text-gray-700 transition-colors"
                                   required
                               />
                           </div>
                           <div>
                               <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email (Optional)</label>
                               <input 
                                   type="email" 
                                   placeholder="hello@example.com"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                                   className="w-full bg-black border border-white/10 rounded-lg p-4 text-white focus:border-yellow-500 outline-none placeholder:text-gray-700 transition-colors"
                               />
                           </div>
                       </div>

                       {/* Ticket Counter */}
                       <div className="bg-black/50 p-6 rounded-xl border border-white/10 flex items-center justify-between mt-4">
                           <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Number of Tickets</span>
                           <div className="flex items-center gap-6">
                               <button 
                                   type="button" 
                                   onClick={decrementTickets}
                                   disabled={tickets <= 1}
                                   className="p-3 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-20 transition-all text-white"
                               >
                                   <Minus className="w-4 h-4" />
                               </button>
                               <span className="text-2xl font-bold w-6 text-center text-white">{tickets}</span>
                               <button 
                                   type="button" 
                                   onClick={incrementTickets}
                                   disabled={tickets >= 3}
                                   className="p-3 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-20 transition-all text-white"
                               >
                                   <Plus className="w-4 h-4" />
                               </button>
                           </div>
                       </div>

                       {/* Total & Submit */}
                       <div className="pt-6 border-t border-white/10">
                           <div className="flex justify-between items-center mb-8">
                               <span className="text-gray-400 text-sm uppercase tracking-widest">Total to Pay</span>
                               <span className="text-3xl font-bold text-yellow-500 font-mono">
                                   KES {screening.price * tickets}
                               </span>
                           </div>
                           
                           {status === "error" && (
                               <p className="text-red-500 text-sm mb-4 text-center bg-red-500/10 p-2 rounded">Payment failed. Please check phone & PIN.</p>
                           )}

                           <button 
                               type="submit"
                               className="w-full bg-yellow-500 text-black font-bold py-5 rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 text-lg shadow-lg shadow-yellow-500/20"
                           >
                               Complete Payment <CheckCircle className="w-5 h-5" />
                           </button>
                           <p className="text-center text-[10px] uppercase tracking-widest text-gray-600 mt-4">
                               Secure M-Pesa Transaction • Max 3 Tickets
                           </p>
                       </div>
                   </form>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}