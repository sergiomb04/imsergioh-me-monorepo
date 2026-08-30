"use client";

import { createChatSocket } from "@/lib/chatSocket";
import { useEffect, useRef, useState } from "react";
import MessageComponent from "@/component/chat/MessageComponent";
import MemberComponent from "@/component/chat/MemberComponent";
import { Send, LogOut, User } from "lucide-react";

export default function ChatComponent({ username, onLogout }) {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [socketObj, setSocketObj] = useState(null);

  useEffect(() => {
    const ws = createChatSocket(username, (data) => {
      if (data.type === "MESSAGES") {
        setMessages((prev) => [...prev, ...data.payload.messages]);
      }
      if (data.type === "MEMBERS") {
        setMembers(data.payload.names || []);
      }
    });

    setSocketObj(ws);

    return () => {
      ws.close();
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const trimmedMessage = message.trim();

    if (socketObj && trimmedMessage) {
      socketObj.send({
        type: "SEND",
        payload: {
          message: JSON.stringify({
            owner: String(username),
            message: String(trimmedMessage),
          }),
        },
      });
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-3">
      {/* Contenedor Principal */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-3.5 shadow-xl">
        {/* Cabecera de Usuario */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-neutral-200">
              <User className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-neutral-400">
                Conectado como
              </span>
              <span className="text-xs sm:text-sm font-bold text-cyan-300 tracking-wide">
                {username}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 hover:text-rose-100 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Miembros Activos */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-400">
            Miembros activos ({members.length})
          </span>
          <div className="flex gap-2 flex-wrap max-h-20 overflow-y-auto">
            {members.length > 0 ? (
              members.map((name, i) => (
                <MemberComponent
                  key={i}
                  name={name}
                  isCurrentUser={name.toLowerCase() === username.toLowerCase()}
                />
              ))
            ) : (
              <span className="text-xs text-neutral-500 italic">
                Cargando participantes...
              </span>
            )}
          </div>
        </div>

        {/* Flujo de Mensajes Ajustado al Viewport */}
        <div className="flex flex-col h-[48vh] sm:h-[52vh] min-h-[280px] overflow-y-auto p-3.5 sm:p-4 space-y-3 rounded-xl border border-white/5 bg-neutral-950/70">
          {messages.length === 0 ? (
            <div className="my-auto flex items-center justify-center text-center text-xs sm:text-sm text-neutral-500 py-8">
              No hay mensajes todavía. ¡Sé el primero en escribir!
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageComponent key={i} message={m} currentUser={username} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Entrada de Mensaje */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-0.5">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 h-11 px-3.5 rounded-xl border border-white/10 bg-neutral-950/80 text-white placeholder:text-neutral-500 outline-none transition focus:border-white/30 text-sm"
          />

          <button
            type="submit"
            disabled={!message.trim()}
            aria-label="Enviar mensaje"
            className={`flex items-center justify-center h-11 px-4 rounded-xl font-medium text-sm transition-all ${
              message.trim()
                ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                : "bg-white/5 text-neutral-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}