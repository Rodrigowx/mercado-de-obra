"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/components/AuthContext";
import { IoIosNotifications, IoMdChatboxes } from "react-icons/io";
import { usePageContext } from "./PageContext";
import { getUserConversations, getLastMessage } from "@/app/services/chatService";

import {
  isSocketReady,
  onMessageReceived,
  offMessageReceived,
  joinNotification,
  onNotifications,
  getSocket,
  connectSocket,
  onNewClientConversation,
  Message
} from "../services/socketServices";

interface NotificationMessage {
  [conversationId: string]: number;
}

const NotificationsMenu: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { isChatPage, chatId } = usePageContext();

  const [activeTab, setActiveTab] = useState<"chats" | "alerts">("chats");
  const [isOpen, setIsOpen] = useState(false);
  const [conversationIds, setConversationIds] = useState<string[]>([]);
  const [lastMessages, setLastMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<NotificationMessage>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalUnread = Object.values(unreadMessages).reduce(
    (acc, curr) => acc + (curr || 0),
    0
  );
  const prevUnreadRef = useRef(totalUnread);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchConversationList(userId: number) {
    try {
      setLoading(true);
      const data = await getUserConversations(userId);
      setConversationIds(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLastMessages(conversations: string[]) {
    try {
      setLoading(true);
      const messages: Message[] = [];
      for (const cId of conversations) {
        const lastMsg = await getLastMessage(cId);
        if (lastMsg) messages.push(lastMsg);
      }
      setLastMessages(messages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Exemplo: lógica com "wasZeroBefore" e "isNonZeroNow"
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const wasZeroBefore = prevUnreadRef.current === 0;
    const isNonZeroNow = totalUnread > 0;

    if (wasZeroBefore && isNonZeroNow) {
      fetchConversationList(user.id);
      fetchLastMessages(conversationIds);
    }

    prevUnreadRef.current = totalUnread;
  }, [totalUnread, conversationIds, user?.id, isAuthenticated]);

  // Efeito: escuta "notifications" e "newClientConversation" no socket
  useEffect(() => {
    const handleNewNotification = (newNotifications: NotificationMessage) => {
      setUnreadMessages((prev) => ({ ...prev, ...newNotifications }));
    };

    const handleNewConversation = (data: {
      conversationId: string;
      message: Message;
      unreadCount: number;
    }) => {
      setConversationIds((prev) => [...prev, data.conversationId]);
      setLastMessages((prev) => [...prev, data.message]);
      setUnreadMessages((prev) => ({
        ...prev,
        [data.conversationId]: data.unreadCount,
      }));
    };

    if (isSocketReady() && isAuthenticated) {
      const socket = getSocket();
      socket.on("notifications", handleNewNotification);
      socket.on("newClientConversation", handleNewConversation);
    }

    return () => {
      if (isSocketReady()) {
        const socket = getSocket();
        socket.off("notifications", handleNewNotification);
        socket.off("newClientConversation", handleNewConversation);
      }
    };
  }, [isAuthenticated]);

  // Efeito: ao logar, conectar socket + fetch conversas
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket(Number(user?.id));
      fetchConversationList(Number(user?.id));
    }

    const handleNewClientConversation = () => {
      // re-fetch se quiser
      fetchConversationList(Number(user?.id));
    };

    if (isSocketReady()) {
      onNewClientConversation(handleNewClientConversation);
    }

    return () => {
      if (isSocketReady()) {
        offMessageReceived(handleNewClientConversation as any); 
        // "as any" pois handleNewClientConversation não recebe param
      }
    };
  }, [user, isAuthenticated]);

  // Efeito: joinNotification + fetchLastMessages sempre que conversationIds mudar
  useEffect(() => {
    const handleNewNotification = (newNotifications: NotificationMessage) => {
      setUnreadMessages((prev) => ({
        ...prev,
        ...newNotifications,
      }));
    };

    if (isAuthenticated) {
      if (isSocketReady()) {
        joinNotification(conversationIds, Number(user?.id));
        fetchLastMessages(conversationIds);
        onNotifications(handleNewNotification);
      }
    }

    return () => {
      if (isSocketReady()) {
        const s = getSocket();
        s.off("notifications", handleNewNotification);
      }
    };
  }, [conversationIds, isAuthenticated]);

  // Efeito: escutar "messageReceived"
  useEffect(() => {
    if (!isAuthenticated || !conversationIds) return;

    const handleNewMessage = (newMsg: Message) => {
      if (isChatPage && chatId === newMsg.conversationId) {
        fetchLastMessages(conversationIds);
        return;
      }

      if (conversationIds.includes(newMsg.conversationId)) {
        fetchLastMessages(conversationIds);
      } else {
        setConversationIds((prev) => [...prev, newMsg.conversationId]);
      }
    };

    if (isSocketReady()) {
      onMessageReceived(handleNewMessage);
    }
    return () => offMessageReceived(handleNewMessage);
  }, [isAuthenticated, conversationIds, isChatPage, chatId]);

  function handleClickConversation(conversationId: string) {
    router.push(`/dashboard/chat/${conversationId}`);
    setIsOpen(false);
    setUnreadMessages((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));
  }

  return (
    <div className="relative" ref={menuRef}>
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

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-700 shadow-lg rounded-md p-4 z-50"
          onClick={(e) => e.stopPropagation()}
        >
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

          {activeTab === "chats" && (
            <div className="max-h-64 overflow-y-auto">
              {loading && <p>Carregando...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && lastMessages.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma conversa</p>
              )}
              {lastMessages.map((message) => {
                const unread = unreadMessages[message.conversationId] || 0;
                return (
                  <div
                    key={message.id}
                    onClick={() => handleClickConversation(message.conversationId)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer rounded-md mb-1 relative"
                  >
                    <p className="text-sm text-gray-700 dark:text-white">
                      <strong>
                        {message.senderId === Number(user?.id)
                          ? " Você: "
                          : `${message.senderName.split(" ")[0]}: `}
                      </strong>
                      {message.content}
                    </p>
                    {unread > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full text-xs px-2 py-0.5">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "alerts" && (
            <div>
              <p className="text-sm text-gray-500 dark:text-white">
                Nenhuma notificação
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
