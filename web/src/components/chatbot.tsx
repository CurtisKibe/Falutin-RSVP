"use client";

import { useState, useRef, useEffect } from "react";
import { Clapperboard, X, Send, Sparkles } from "lucide-react"; 

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "<b>Lights, Camera, Action!</b> 🎬 <br><br>Welcome to the Falutin Fam! 🍿 Hi, I'm <b>Fellini</b> your guide to the best home screening experience in Nairobi. The lineup is looking incredible—are you here to grab a ticket or discuss the movies? " }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgObj: Message = { role: "user", text: input };
    const newMessages = [...messages, userMsgObj];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // 1. Filter out any empty messages before sending to API
      const apiHistory = newMessages
        .filter(m => m.text && m.text.trim() !== "")
        .map(m => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.text
        }));

      const res = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: apiHistory }), 
      });
      
      if (!res.ok) throw new Error("Server responded with an error");
      
      const data = await res.json();
      
      // 2. FIXED: Changed data.reply to data.response to match your index.py
      const aiText = data.response || data.reply || "I'm lost for words. Try again?";
      
      setMessages((prev) => [...prev, { role: "bot", text: aiText }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [...prev, { role: "bot", text: "Cut! 🎬 Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-yellow-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 border-2 border-black group"
        >
          <Clapperboard className="w-8 h-8 group-hover:-rotate-12 transition-transform" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
          
          {/* Header */}
          <div className="bg-yellow-500 p-4 flex justify-between items-center text-black">
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Falutin Box Office</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 text-sm rounded-xl ${
                    msg.role === "user"
                      ? "bg-yellow-500 text-black font-medium"
                      : "bg-neutral-800 text-gray-200 border border-neutral-700"
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 p-3 rounded-xl flex gap-2 items-center text-xs text-gray-400">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Writing script...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-neutral-900 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              placeholder="Chat with Fellini..."
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