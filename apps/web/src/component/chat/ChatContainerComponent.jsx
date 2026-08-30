"use client";

import ChatComponent from "@/component/chat/ChatComponent";
import EnterUsernameComp from "@/component/chat/EnterUsernameComp";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ChatContainerComponent() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chat-username");
      if (saved) setUsername(saved);
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
    setLoading(false);
  }, []);

  const handleSetUsername = (newUsername) => {
    try {
      localStorage.setItem("chat-username", newUsername);
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
    setUsername(newUsername);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("chat-username");
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
    setUsername("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Iniciando entorno de chat...</span>
      </div>
    );
  }

  return username ? (
    <ChatComponent username={username} onLogout={handleLogout} />
  ) : (
    <EnterUsernameComp handleSetUsername={handleSetUsername} />
  );
}