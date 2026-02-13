"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Film } from "lucide-react"; 

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function AdminChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "<b>System Online.</b> <br><br>Welcome back, Admin. I am <b>Lumière</b>. The projector is ready and the dashboard is active. Shall we review the <b>current stats</b>, or are you ready to <b>curate the next screening</b>?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsgObj: Message = { role: "user", text: input };
    const newHistory = [...messages, userMsgObj];
    
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const apiHistory = newHistory.map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            history: apiHistory,
            isAdmin: true,
          }), 
      });
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      console.error("Admin Chat Error:", err);
      setMessages((prev) => [...prev, { role: "bot", text: "Production connection failed." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-yellow-500 text-black p-4 rounded-full shadow-2xl hover:bg-yellow-400 hover:scale-110 transition-transform z-50 border-2 border-black group"
        >
          {/* Film Icon with slight rotation effect */}
          <Film className="w-8 h-8 group-hover:animate-spin-slow transition-transform" />
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-150 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
          
          {/* Header: THE PRODUCTION STUDIO */}
          <div className="bg-yellow-500 p-4 flex justify-between items-center text-black border-b border-black/10">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-xs">The Production Studio</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3 text-sm rounded-xl ${
                    msg.role === "user"
                      ? "bg-yellow-500 text-black font-medium" 
                      : "bg-neutral-800 text-gray-300 border border-neutral-700" 
                  } dangerously-set-html`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 p-3 rounded-xl flex gap-2 items-center text-xs text-gray-400">
                  <Sparkles className="w-3 h-3 animate-spin text-yellow-500" />
                  <span>Production running...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-neutral-900 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask The Producer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-black border border-neutral-700 text-white rounded-lg px-4 py-2 text-sm focus:border-yellow-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 text-black p-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}