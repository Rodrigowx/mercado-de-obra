"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthContext";
import { IoIosNotifications, IoMdChatboxes } from "react-icons/io";
import { usePageContext } from "./PageContext";
import {
  getUserConversations,
  getLastMessage,
} from "@/app/services/chatService";

import {
  getSocket,
  onMessageReceived,
  offMessageReceived,
  joinNotification,
  onNotifications,
  offNotifications,
  onNewClientConversation,
  offNewClientConversation,
  Message,
} from "../services/socketServices";

interface NotificationMessage {
  [conversationId: string]: number;
}

const NotificationsMenu: React.FC = () => {
  const router = useRouter();
  const { user, socketConnected } = useAuth();
  const { isChatPage, chatId } = usePageContext();

  const [activeTab, setActiveTab] = useState<"chats" | "alerts">("chats");
  const [isOpen, setIsOpen] = useState(false);
  const [conversationIds, setConversationIds] = useState<string[]>([]);
  const [lastMessages, setLastMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<NotificationMessage>({});
  const [loading, setLoading] = useState(false);
  const [lastSender, setLastSender] = useState("Usuário");
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const totalUnread = Object.values(unreadMessages).reduce(
    (acc, curr) => acc + (curr || 0),
    0
  );

  const toggleMenu = () => setIsOpen(!isOpen);

  // Fecha o menu se clicar fora (sem alterações)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchConversationList = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserConversations(userId);
      setConversationIds(data);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar conversas");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastMessages = async (conversations: string[]) => {
    if (conversations.length === 0) {
      setLastMessages([]);
      return;
    }
    try {
      if (loading) return;
      setLoading(true);
      setError(null);
      const messagesPromises = conversations.map((cId) => getLastMessage(cId));
      const results = await Promise.allSettled(messagesPromises);
      const messages = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as PromiseFulfilledResult<Message>).value);

      messages.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLastMessages(messages);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar últimas mensagens");
    } finally {
      setLoading(false);
    }
  };

  // Efeito 1: Buscar lista inicial de conversas quando autenticado
  useEffect(() => {
    if (socketConnected && user?.id) {
      fetchConversationList(user.id);
    } else {
      // Limpa estado relacionado às conversas se deslogar
      setConversationIds([]);
      setLastMessages([]);
      setUnreadMessages({});
    }
  }, [socketConnected, user?.id]);

  // Efeito 2: Buscar últimas mensagens quando a lista de conversas mudar
  useEffect(() => {
    if (socketConnected && conversationIds.length > 0) {
      fetchLastMessages(conversationIds);
    } else {
      setLastMessages([]); // Limpa se não houver conversas
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationIds, socketConnected]); // Depende da lista de IDs

  // Efeito 3: Juntar salas de conversa específicas e gerenciar listeners
  useEffect(() => {
    // Só roda se autenticado E socket conectado
    if (socketConnected && user?.id) {
      // 3a: Entrar nas salas das conversas atuais
      // O AuthContext já entrou na sala pessoal 'notification_userId'
      // Aqui entramos nas salas 'conversation_...' para estas conversas
      joinNotification(conversationIds, user.id);

      // 3b: Configurar Listeners
      const handleNewNotification = (newNotifications: NotificationMessage) => {
        setUnreadMessages((prev) => ({ ...prev, ...newNotifications }));
      };

      const handleNewMessage = (newMsg: Message) => {
        // Atualiza a última mensagem na lista
        setLastMessages((prev) => {
          const index = prev.findIndex(
            (m) => m.conversationId === newMsg.conversationId
          );
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newMsg;
            // Reordena para manter a mais recente no topo, se necessário
            updated.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
            return updated;
          }
          // Se a conversa for nova, handleNewConversation já deve ter adicionado
          return prev;
        });
        setLastSender(newMsg.senderName); // Atualiza o último remetente
        // A contagem de não lidas é atualizada por handleNewNotification
      };

      const handleNewConversation = (data: {
        conversationId: string;
        message: Message; // A primeira mensagem da nova conversa
        unreadCount: number;
      }) => {
        // Adiciona a nova conversa ID se não existir
        setConversationIds((prev) =>
          prev.includes(data.conversationId)
            ? prev
            : [...prev, data.conversationId]
        );
        // Adiciona a primeira mensagem à lista de últimas mensagens
        setLastMessages((prev) => {
          // Evita duplicar se já existir por algum motivo
          if (prev.some((m) => m.conversationId === data.conversationId))
            return prev;
          const updated = [...prev, data.message];
          updated.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return updated;
        });
        // Define a contagem inicial de não lidas
        setUnreadMessages((prev) => ({
          ...prev,
          [data.conversationId]: data.unreadCount,
        }));
        // Importante: A atualização de conversationIds neste handle
        // vai disparar este useEffect novamente, fazendo com que
        // o joinNotification seja chamado com a nova lista,
        // adicionando o join na sala da nova conversa automaticamente.
      };

      onNotifications(handleNewNotification);
      onNewClientConversation(handleNewConversation);
      onMessageReceived(handleNewMessage);

      // Limpeza dos listeners deste efeito
      return () => {
        offNotifications?.(handleNewNotification);
        offNewClientConversation?.(handleNewConversation);
        offMessageReceived(handleNewMessage);
      };
    }
    // Depende do estado da conexão, auth, user e DA LISTA DE CONVERSAS
    // para re-executar o joinNotification quando a lista mudar
  }, [socketConnected, user?.id, conversationIds]);

  // --- Handler de Clique (sem alterações) ---
  function handleClickConversation(conversationId: string) {
    router.push(`/dashboard/chat/${conversationId}`);
    setIsOpen(false);

    // Zera localmente
    setUnreadMessages((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));

    // Informa o backend que as mensagens foram lidas ao entrar na conversa
    // (O ChatPage provavelmente fará isso ao montar/entrar na sala)
    // Mas podemos emitir aqui também como uma ação imediata se desejado
    const socket = getSocket();
    if (socket && user?.id) {
      socket.emit("markAsRead", { conversationId, userId: Number(user.id) });
    }
  }

  // --- Renderização (sem alterações) ---
  return (
    <div className="relative" ref={menuRef}>
      {/* Botão */}
      <button
        className="relative px-3 py-2 bg-gray-200 dark:bg-secondary rounded-full hover:bg-gray-300"
        onClick={toggleMenu}
      >
        <span className="flex flex-row justify-center text-lg items-center">
          <IoMdChatboxes className="mr-2" />
          <IoIosNotifications />
        </span>
        {!isOpen && totalUnread > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full text-xs px-2 py-0.5">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-700 shadow-lg rounded-md p-4 z-50"
          onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro
        >
          {/* Abas */}
          <div className="flex gap-4 mb-3 border-b border-gray-300 dark:border-gray-600">
            <button
              className={`pb-2 ${
                activeTab === "chats" ? "border-b-2 border-orange-500" : ""
              }`}
              onClick={() => setActiveTab("chats")}
            >
              <IoMdChatboxes className="text-xl" />
            </button>
            <button
              className={`pb-2 ${
                activeTab === "alerts" ? "border-b-2 border-orange-500" : ""
              }`}
              onClick={() => setActiveTab("alerts")}
            >
              <IoIosNotifications className="text-xl" />
            </button>
          </div>

          {/* Conteúdo da Aba Chats */}
          {activeTab === "chats" && (
            <div className="max-h-64 overflow-y-auto">
              {loading && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 p-2">
                  Carregando...
                </p>
              )}
              {error && <p className="text-red-500 p-2">{error}</p>}
              {!loading && !error && lastMessages.length === 0 && (
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 p-2">
                  Nenhuma conversa
                </p>
              )}
              {!loading &&
                !error &&
                socketConnected &&
                lastMessages.map((message) => {
                  const unread = unreadMessages[message.conversationId] || 0;
                  return (
                    <div
                      key={message.id || message.conversationId} // Usa conversationId como fallback de key
                      onClick={() =>
                        handleClickConversation(message.conversationId)
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer rounded-md mb-1 relative group"
                    >
                      <p className="text-sm text-gray-700 dark:text-white truncate">
                        {" "}
                        {/* Truncate para texto longo */}
                        <strong>
                          {message.senderId === Number(user?.id)
                            ? " Você: "
                            : `${
                                message.senderName?.split(" ")[0] || "Usuário"
                              }: `}
                        </strong>
                        {message.content}
                      </p>
                      {unread > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full text-xs px-2 py-0.5 flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Conteúdo da Aba Alerts */}
          {activeTab === "alerts" && (
            <div>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 p-2">
                Nenhuma notificação no momento
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
