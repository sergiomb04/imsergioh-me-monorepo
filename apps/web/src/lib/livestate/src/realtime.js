"use client";

import { useState, useEffect } from "react";

const socketManager = {
  ws: null,
  connectionState: "closed",
  subscriptions: {},
  pendingSubscriptions: [],
  pendingActions: [],
  token: null,

  connectionListeners: new Set(),

  setConnectionState(state) {
    this.connectionState = state;
    this.connectionListeners.forEach((cb) => cb(state));
  },
};

const realtimeUrl =
  process.env.NEXT_PUBLIC_LIVESTATE_URL || "https://livestate.imsergioh.me";

function toWebSocketUrl(rawUrl) {
  if (!rawUrl) return "";
  let formatted = String(rawUrl).trim();
  if (formatted.startsWith("http://")) {
    formatted = "ws://" + formatted.slice(7);
  } else if (formatted.startsWith("https://")) {
    formatted = "wss://" + formatted.slice(8);
  }
  return formatted;
}

export function connect(url = `${realtimeUrl}/realtime`, token) {
  if (socketManager.ws) return;

  socketManager.token = token;

  let reconnectAttempts = 0;
  let batch = [];
  let batchTimeout;

  function createSocket() {
    socketManager.setConnectionState("connecting");
    const targetWsUrl = toWebSocketUrl(url);
    const ws = new WebSocket(targetWsUrl);

    ws.onopen = () => {
      socketManager.setConnectionState("open");
      reconnectAttempts = 0;

      if (socketManager.token) {
        sendAction("auth", { token: socketManager.token });
      }

      Object.keys(socketManager.subscriptions).forEach((subKey) => {
        sendAction("subscribe", { sub: subKey });
      });

      socketManager.pendingSubscriptions.forEach((sub) => {
        sendAction("subscribe", { sub });
      });
      socketManager.pendingSubscriptions = [];

      socketManager.pendingActions.forEach(({ actionName, data }) => {
        sendAction(actionName, data);
      });
      socketManager.pendingActions = [];
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const key = data.channel;

      if (socketManager.subscriptions[key]) {
        batch.push({
          key,
          data: data.payload,
        });
      }

      if (!batchTimeout) {
        batchTimeout = setTimeout(() => {
          batch.forEach(({ key, data }) => {
            socketManager.subscriptions[key].forEach((cb) => cb(data));
          });

          batch = [];
          batchTimeout = null;
        }, 50);
      }
    };

    ws.onclose = () => {
      socketManager.setConnectionState("closed");
      socketManager.ws = null;

      const timeout = Math.min(
        1000 * 2 ** reconnectAttempts,
        30000
      );

      setTimeout(() => {
        reconnectAttempts++;
        createSocket();
      }, timeout);
    };

    socketManager.ws = ws;
  }

  createSocket();
}

export function sendAction(actionName, data = {}) {
  if (!socketManager.ws || socketManager.connectionState !== "open") {
    socketManager.pendingActions.push({
      actionName,
      data,
    });
    return;
  }

  socketManager.ws.send(
    JSON.stringify({
      action: actionName,
      ...data,
    })
  );
}

export function getConnectionState() {
  return socketManager.connectionState;
}

export default function publish(channel, data) {
  sendAction("publish", {
    channel,
    data,
  });
}

export function useRealtimeState(key, initialValue, token) {
  const [state, setState] = useState(initialValue);
  const [connectionState, setConnectionState] = useState(
    socketManager.connectionState
  );

  useEffect(() => {
    if (!socketManager.subscriptions[key]) {
      socketManager.subscriptions[key] = new Set();
    }

    socketManager.subscriptions[key].add(setState);

    connect(undefined, token);

    if (socketManager.connectionState === "open") {
      sendAction("subscribe", { sub: key });
    } else {
      socketManager.pendingSubscriptions.push(key);
    }

    const onConnectionChange = (state) => {
      setConnectionState(state);
    };

    socketManager.connectionListeners.add(onConnectionChange);

    return () => {
      socketManager.subscriptions[key].delete(setState);

      if (socketManager.subscriptions[key].size === 0) {
        delete socketManager.subscriptions[key];

        if (
          socketManager.ws &&
          socketManager.connectionState === "open"
        ) {
          sendAction("unsubscribe", {
            sub: key,
          });
        }
      }

      socketManager.connectionListeners.delete(onConnectionChange);
    };
  }, [key, token]);

  return [state, setState, connectionState];
}