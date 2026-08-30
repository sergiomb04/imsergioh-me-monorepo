const rawChatWsUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL || "wss://chat.imsergioh.me";
const CHAT_WS_URL = rawChatWsUrl
  .replace(/^http:\/\//i, "ws://")
  .replace(/^https:\/\//i, "wss://");

export function createChatSocket(username, onMessage) {
    const socket = new WebSocket(CHAT_WS_URL);

    socket.onopen = () => {
        console.log("✅ Conectado al servidor WebSocket");

        const enterMsg = {
            type: "ENTER",
            payload: {name: username},
        };
        socket.send(JSON.stringify(enterMsg));
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
        } catch (e) {
            console.error("❌ Error al parsear mensaje:", e);
        }
    };

    socket.onclose = () => {
        console.log("🔌 Conexión cerrada");
    };

    socket.onerror = (err) => {
        console.error("⚠️ Error WebSocket:", err);
    };

    return {
        socket,
        send: (msg) => socket.send(JSON.stringify(msg)),
        close: () => socket.close(),
    };
}
