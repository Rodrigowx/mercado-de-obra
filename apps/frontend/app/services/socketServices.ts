// app/services/socketService.ts
"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

interface Message {
  id?: string;
  conversationId: string;
  senderId: number;
  content: string;
  createdAt?: string;
  attachments?: string[];
  conversation: {
    clientId: number;
    professionalId: number;
    client: {
      name: string;
    };
    professional: {
      name: string;
    };
  };
}

/**
 * Conecta o socket passando o userId via query para o handshake.
 */
export function connectSocket(userId: number) {
  socket = io(
    process.env.NEXT_PUBLIC_CHAT_URI
      ? `${process.env.NEXT_PUBLIC_CHAT_URI}:4000`
      : "http://localhost:4000",
    {
      query: { userId: userId.toString() },
    }
  );

  socket.on("connect", () => {
    console.log("Socket conectado:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado.");
  });
}

export function joinNotification(conversationIds: string[], userId: number) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket primeiro.");
  }
  socket.emit("joinNotification", { conversationIds, userId });
}

export interface Notification {
  [key: string]: any;
}

export function onNotifications(callback: (notifications: any) => void) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket primeiro.");
  }
  socket.on("notifications", callback);
}

export function getSocket() {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket primeiro.");
  }
  return socket;
}

/**
 * Faz o cliente entrar na "sala" (room) da conversa,
 * para receber mensagens em tempo real dessa conversa.
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
    socket?.once("recentMessages", (messages) => {
      resolve(messages);
    });
  });
}

export function isSocketReady() {
  // Retorna true se o socket existir e estiver conectado
  return !!socket && socket.connected;
}

/**
 * Desconecta o socket manualmente.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket desconectado manualmente.");
  } else {
    console.log("Socket já está desconectado.");
  }
}

/**
 * Sai da sala
 */
export function leaveConversation(conversationId: string) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket() primeiro.");
  }
  socket.emit("leaveConversation", { conversationId });
}

/**
 * Envia uma mensagem em tempo real via socket
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

export function markAsReadSocket(conversationId: string, userId: number) {
  if (!socket) {
    throw new Error("Socket não conectado.");
  }
  socket.emit("markAsRead", { conversationId, userId });
}

interface NewConversationNotification {
  conversationId: string;
  message: any;
  unreadCount: number;
}

export function onNewClientConversation(
  callback: (data: NewConversationNotification) => void
) {
  if (!socket) throw new Error("Socket não conectado");
  socket.on("newClientConversation", callback);
}

/**
 * Adiciona um listener para quando as mensagens forem marcadas como lidas (emitida do servidor).
 */
export function onMessagesMarkedAsRead(callback: (data: any) => void) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket() primeiro.");
  }
  socket.on("messagesMarkedAsRead", callback);
}

/**
 * Remove o listener de 'messagesMarkedAsRead' (opcional, para cleanup).
 */
export function offMessagesMarkedAsRead(callback: (data: any) => void) {
  if (!socket) return;
  socket.off("messagesMarkedAsRead", callback);
}

/**
 * Adiciona um listener para quando uma nova mensagem chegar (emitida do servidor).
 */
export function onMessageReceived(callback: (message: any) => void) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket() primeiro.");
  }
  socket.on("messageReceived", callback);
}

/**
 * Remove o listener de 'messageReceived' (opcional, para cleanup).
 */
export function offMessageReceived(callback: (message: any) => void) {
  if (!socket) return;
  socket.off("messageReceived", callback);
}

/**
 * Exemplo de listener para "notificações" se quiser algo global,
 * Ajuste conforme sua lógica de notificação real.
 */
export function onNotification(callback: (data: any) => void) {
  if (!socket) {
    throw new Error("Socket não conectado. Chame connectSocket() primeiro.");
  }
  socket.on("notification", callback);
}
