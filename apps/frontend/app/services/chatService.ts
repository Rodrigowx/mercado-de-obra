// app/services/chatService.ts
export const BASE_URL = `${process.env.NEXT_PUBLIC_CHAT_URI || 'http://localhost:4000'}/chat`;

/**
 * Cria uma conversa entre client e professional
 */
export async function createConversation(
  clientId: number,
  professionalId: number,
  clientName: string,
  professionalName: string
) {
  const response = await fetch(`${BASE_URL}/conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, professionalId, clientName, professionalName }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao criar conversa: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Envia uma mensagem via REST (não em tempo real).
 * Ideal se você quiser usar HTTP ao invés de socket.
 */
export async function sendMessageAPI(
  conversationId: string,
  senderId: number,
  content: string,
  attachments?: string[]
) {
  const response = await fetch(`${BASE_URL}/conversation/${conversationId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId: senderId.toString(), content, attachments }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca todas as mensagens de uma conversa
 */
export async function getMessages(conversationId: string) {
  const response = await fetch(`${BASE_URL}/conversation/${conversationId}/messages`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar mensagens: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fecha uma conversa
 */
export async function closeConversation(conversationId: string) {
  const response = await fetch(`${BASE_URL}/conversation/${conversationId}/close`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error(`Erro ao fechar conversa: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca as conversas (IDs) de um determinado usuário
 */
export async function getUserConversations(userId: number) {
  const response = await fetch(`${BASE_URL}/user-conversations/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar conversas do usuário: ${response.statusText}`);
  }

  return response.json() as Promise<string[]>;
}

/**
 * Busca a última mensagem de uma conversa
 */
export async function getLastMessage(conversationId: string) {
  const response = await fetch(`${BASE_URL}/conversation/${conversationId}/last-message`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar última mensagem: ${response.statusText}`);
  }

  const data = await response.json();
  return data; // pode ser null se não tiver mensagens
}
