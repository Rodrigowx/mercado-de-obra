"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Interface única para mensagens, incluindo
 * senderName e createdAt como obrigatórios,
 * pois o NotificationsMenu.tsx usa essas props.
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  attachments?: string[];
  conversation?: {
    clientId: number;
    professionalId: number;
    client: { name: string };
    professional: { name: string };
  };
}

export function connectSocket(userId: number) {
  socket = io(
    process.env.NEXT_PUBLIC_CHAT_URI
      ? process.env.NEXT_PUBLIC_CHAT_URI
      : "http://localhost:4000",
    {
      query: { userId: userId.toString() },
      transports: ["websocket", "polling"],
      path: "/socket.io/",
    }
  );

  socket.on("connect", () => {
    console.log("✅ Socket conectado:", socket?.id, "UserId:", userId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket desconectado.");
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Erro de conexão socket:", err.message);
  });
}

export function isSocketReady() {
  return !!socket && socket.connected;
}

export function getSocket() {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket() primeiro.");
  }
  return socket;
}

/**
 * Entrar na sala de notificações + conversas do usuário
 */
export function joinNotification(conversationIds: string[], userId: number) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket primeiro.");
  }
  socket.emit("joinNotification", { conversationIds, userId });
}

export function onNotifications(callback: (notifications: any) => void) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket primeiro.");
  }
  socket.on("notifications", callback);
}

/**
 * Recebe o evento `newClientConversation` com payload:
 * { conversationId, message, unreadCount }
 */
export function onNewClientConversation(
  callback: (data: { conversationId: string; message: Message; unreadCount: number }) => void
) {
  if (!socket) throw new Error("Socket não conectado");
  socket.on("newClientConversation", callback);
}

/**
 * Envia uma mensagem
 */
export function sendMessageSocket(
  conversationId: string,
  senderId: number,
  content: string,
  attachments?: string[]
) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket() primeiro.");
  }
  socket.emit("sendMessage", {
    conversationId,
    senderId,
    content,
    attachments,
  });
}

/**
 * Entrar na sala de conversa (receber mensagens antigas etc.)
 */
export function joinConversation(
  conversationId: string,
  userId: number
): Promise<Message[]> {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket() primeiro.");
  }

  socket.emit("joinConversation", { conversationId, userId });

  return new Promise((resolve) => {
    socket?.once("recentMessages", (messages: Message[]) => {
      resolve(messages);
    });
  });
}

/**
 * Escutar mensagens que chegam em tempo real
 */
export function onMessageReceived(callback: (message: Message) => void) {
  if (!socket) throw new Error("Socket não conectado");
  socket.on("messageReceived", callback);
}

export function offMessageReceived(callback: (message: Message) => void) {
  if (!socket) return;
  socket.off("messageReceived", callback);
}

/**
 * Marca como lida
 */
export function markAsReadSocket(conversationId: string, userId: number) {
  if (!socket) {
    throw new Error("Socket não conectado.");
  }
  socket.emit("markAsRead", { conversationId, userId });
}

/**
 * Recebe evento de "messagesMarkedAsRead"
 */
export function onMessagesMarkedAsRead(callback: (data: any) => void) {
  if (!socket) {
    throw new Error("Socket não conectado.");
  }
  socket.on("messagesMarkedAsRead", callback);
}

export function offMessagesMarkedAsRead(callback: (data: any) => void) {
  if (!socket) return;
  socket.off("messagesMarkedAsRead", callback);
}

/**
 * Sair de uma conversa
 */
export function leaveConversation(conversationId: string) {
  if (!socket) {
    throw new Error("Socket não conectado.");
  }
  socket.emit("leaveConversation", { conversationId });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket desconectado manualmente.");
  }
}
