"use client";

import { usePathname } from "next/navigation";
import ChatBot from "@/components/chatbot"; 

export default function PublicChatWrapper() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <ChatBot />;
}