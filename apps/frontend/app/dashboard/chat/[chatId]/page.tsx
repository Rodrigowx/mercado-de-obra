"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/components/AuthContext";
import {
  joinConversation,
  leaveConversation,
  onMessageReceived,
  offMessageReceived,
  sendMessageSocket,
  markAsReadSocket,
  onMessagesMarkedAsRead,
  offMessagesMarkedAsRead,
  getSocket,
} from "@/app/services/socketServices";
import { closeConversation } from "@/app/services/chatService";
import { debounce } from "lodash";
import { IoSend } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { TiMessageTyping } from "react-icons/ti";
import { FaEdit } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { NEED_BY_CHAT_ID, BUDGET_BY_NEED_ID } from "@/app/graphql/queries";
import { CREATE_BUDGET, UPDATE_BUDGET } from "@/app/graphql/mutations";
import { useUnitsContext } from "../../../components/UnitsContext";

interface Message {
  id?: string;
  conversationId: string;
  senderId: number;
  content: string;
  createdAt?: string;
  clientRead?: boolean;
  professionalRead?: boolean;
  conversation?: {
    clientId: number;
    professionalId: number;
    client: { name: string };
    professional: { name: string };
  };
}

interface Need {
  id: number;
  title: string;
  description: string;
  clientId: number;
  professionalId: number;
  chatId: string;
  serviceId: number;
  createdAt: string;
  updatedAt: string;
}

// Para o formulário dos serviços, armazenamos quantity e serviceValue como string para permitir campo vazio.
interface BudgetServiceInput {
  task: string;
  quantity: string;
  unitOfMeasurementId: number;
  serviceValue: number;
}

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const router = useRouter();
  const { user, isAuthenticated, socketConnected } = useContext(AuthContext);
  const userId = Number(user?.id);
  const isProfessional = user?.role === "PROFESSIONAL";

  // Estados do Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>(
    {}
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<Message | null>(null);

  const [clientName, setClientName] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [professionalId, setProfessionalId] = useState<number | null>(null);

  // Estados do Orçamento
  const [showBudgetPanel, setShowBudgetPanel] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [budgetId, setBudgetId] = useState<number | null>(null);
  const [budgetTotalCost, setBudgetTotalCost] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  // Removemos o input manual para totalTotalCost, pois será calculado a partir dos serviços.
  const [budgetServices, setBudgetServices] = useState<BudgetServiceInput[]>(
    []
  );

  // Query: listar as Needs do chat
  const {
    data: needsData,
    loading: needsLoading,
    error: needsError,
  } = useQuery(NEED_BY_CHAT_ID, {
    variables: { chatId },
    skip: !isAuthenticated || !chatId,
    fetchPolicy: "network-only",
  });

  // LazyQuery: buscar Budget pela Need (forçando refetch com network-only)
  const [loadBudgetByNeed] = useLazyQuery(BUDGET_BY_NEED_ID, {
    fetchPolicy: "network-only",
  });

  // Mutations do Budget
  const [createBudget] = useMutation(CREATE_BUDGET);
  const [updateBudget] = useMutation(UPDATE_BUDGET);

  // Units Context
  const { units } = useUnitsContext();

  // Debounce para typingStop
  const emitTypingStopRef = useRef(
    debounce(() => {
      if (socketConnected) {
        getSocket().emit("typingStop", { conversationId: chatId, userId });
      }
    }, 1000)
  );

  // ==================== SOCKET & MENSAGENS ====================

  useEffect(() => {
    if (!chatId || !socketConnected || !userId) return;

    let mounted = true;

    async function fetchAndJoin() {
      if (!socketConnected) {
        console.log("⏳ Socket ainda não está pronto, aguardando...");
        return false;
      }

      try {
        console.log("🔄 Entrando na conversa:", chatId);
        const recentMessages = await joinConversation(chatId, userId);

        if (!mounted) return false;

        if (recentMessages.length > 0) {
          const first = recentMessages[0];
          if (first.conversation) {
            setClientName(first.conversation.client.name);
            setClientId(first.conversation.clientId);
            setProfessionalName(first.conversation.professional.name);
            setProfessionalId(first.conversation.professionalId);
          }
          setMessages(recentMessages);
        }

        markAsReadSocket(chatId, userId);
        return true;
      } catch (error) {
        console.error("❌ Erro ao entrar na conversa:", error);
        return false;
      }
    }

    // Tenta conectar imediatamente e configura um retry se falhar
    fetchAndJoin();

    // Verifica a cada 500ms se o socket está pronto
    const checkInterval = setInterval(async () => {
      if (await fetchAndJoin()) {
        clearInterval(checkInterval);
        console.log("✅ Conversa conectada com sucesso!");
      }
    }, 500);

    return () => {
      mounted = false;
      clearInterval(checkInterval);
      if (socketConnected) {
        console.log("👋 Saindo da conversa:", chatId);
        leaveConversation(chatId);
      }
    };
  }, [chatId, socketConnected]);

  useEffect(() => {
    if (!socketConnected) return;

    const handleNewMessage = (newMsg: Message) => {
      console.log("📩 Nova mensagem recebida:", newMsg);
      if (newMsg.conversationId === chatId) {
        setMessages((prev) => {
          // Verifica se a mensagem já existe para evitar duplicação
          const exists = prev.some((msg) => msg.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      }
    };

    onMessageReceived(handleNewMessage);

    return () => {
      console.log("🛑 Removendo ouvinte de mensagens");
      offMessageReceived(handleNewMessage);
    };
  }, [chatId, socketConnected]);

  // useEffect(() => {
  //   if (!messages.length) return;

  //   // Always scroll to the bottom when messages update
  //   setTimeout(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, 300);

  //   // Update the last message reference
  //   lastMessageRef.current = messages[messages.length - 1];
  // }, [messages]);

  useEffect(() => {
    if (!socketConnected || !messages.length || !isAuthenticated) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.conversationId === chatId && lastMsg.senderId !== userId) {
      markAsReadSocket(chatId, userId);
    }
  }, [chatId, socketConnected, messages]);

  useEffect(() => {
    const handleRead = (data: { conversationId: string; userId: number }) => {
      if (data.conversationId !== chatId) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (data.userId === msg.conversation?.clientId)
            return { ...msg, clientRead: true };
          if (data.userId === msg.conversation?.professionalId)
            return { ...msg, professionalRead: true };
          return msg;
        })
      );
    };
    if (socketConnected) {
      onMessagesMarkedAsRead(handleRead);
    }
    return () => {
      if (socketConnected) {
        offMessagesMarkedAsRead(handleRead);
      }
    };
  }, [chatId, socketConnected]);

  useEffect(() => {
    return () => {
      emitTypingStopRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (!socketConnected) return;
    const handleTypingStart = (data: {
      userId: number;
      conversationId: string;
    }) => {
      if (data.conversationId === chatId) {
        const name = data.userId === clientId ? clientName : professionalName;
        setTypingUsers((prev) => ({ ...prev, [data.userId]: name }));
      }
    };
    const handleTypingStop = (data: {
      userId: number;
      conversationId: string;
    }) => {
      if (data.conversationId === chatId) {
        setTypingUsers((prev) => {
          const newState = { ...prev };
          delete newState[data.userId];
          return newState;
        });
      }
    };
    getSocket().on("typingStart", handleTypingStart);
    getSocket().on("typingStop", handleTypingStop);
    return () => {
      getSocket().off("typingStart", handleTypingStart);
      getSocket().off("typingStop", handleTypingStop);
    };
  }, [chatId, clientId, clientName, professionalName]);

  // ==================== FUNÇÕES DE CHAT ====================
  function handleSendMessage() {
    if (!content.trim() || !socketConnected) return;

    sendMessageSocket(chatId, userId, content);
    getSocket().emit("typingStop", { conversationId: chatId, userId });
    setContent("");
  }

  async function handleCloseConversation() {
    try {
      await closeConversation(chatId);
      router.push("/");
    } catch (error) {
      console.error("Erro ao fechar conversa:", error);
    }
  }

  function getSenderName(msg: Message) {
    if (msg.senderId === userId) return "Você";
    if (msg.senderId === msg.conversation?.clientId)
      return clientName || "Cliente";
    return professionalName || "Profissional";
  }

  function getReadIcon(msg: Message) {
    if (msg.senderId !== userId) return null;
    const iAmClient = msg.conversation?.clientId === userId;
    const otherSideRead = iAmClient ? msg.professionalRead : msg.clientRead;
    return otherSideRead ? (
      <span className="text-blue-700 font-black">✓✓</span>
    ) : (
      <span className="text-gray-600 dark:text-gray-300 font-extrabold">✓</span>
    );
  }

  // ==================== FUNÇÕES DE ORÇAMENTO ====================

  // Ao selecionar uma Need, carrega o Budget (se existir) e refaz o fetch
  async function handleSelectNeed(needId: number) {
    setSelectedNeedId(needId);
    setBudgetId(null);
    setBudgetTotalCost(null);
    setDescription("");
    // Removemos o totalTotalCost manual e limpamos os serviços
    setBudgetServices([]);

    if (needId) {
      const result = await loadBudgetByNeed({ variables: { needId } });
      const existingBudget = result.data?.budgetByNeedId;
      if (existingBudget) {
        setBudgetId(existingBudget.id);
        setBudgetTotalCost(existingBudget.totalCost);
        setDescription(existingBudget.description || "");
        if (existingBudget.budgetServices) {
          setBudgetServices(
            existingBudget.budgetServices.map((bs: any) => ({
              task: bs.task,
              quantity: bs.quantity.toString(),
              unitOfMeasurementId: bs.unitOfMeasurementId,
              serviceValue: bs.serviceValue,
            }))
          );
        }
      }
    }
  }

  // Adiciona um novo item de serviço (campos iniciam vazios)
  function handleAddServiceItem() {
    setBudgetServices((prev) => [
      ...prev,
      { task: "", quantity: "", unitOfMeasurementId: 0, serviceValue: 0 },
    ]);
  }

  // Remove um item de serviço
  function handleRemoveServiceItem(idx: number) {
    setBudgetServices((prev) => prev.filter((_, i) => i !== idx));
  }

  // Salva o Budget (CREATE ou UPDATE)
  async function handleSaveBudget() {
    try {
      if (!isProfessional) {
        alert("Apenas profissionais podem criar/editar orçamentos.");
        return;
      }
      if (!selectedNeedId) {
        alert("Selecione uma Need para criar o orçamento.");
        return;
      }

      // Calcula o total a partir dos valores individuais dos serviços
      const computedTotalCost = budgetServices.reduce(
        (acc, cur) => acc + Number(cur.serviceValue),
        0
      );

      const inputData = {
        needId: selectedNeedId,
        clientId,
        professionalId,
        description,
        totalCost: computedTotalCost,
        budgetServices: budgetServices.map((bs) => ({
          unitOfMeasurementId: bs.unitOfMeasurementId,
          task: bs.task,
          serviceValue: bs.serviceValue,
          quantity: bs.quantity ? parseFloat(bs.quantity) : 0,
        })),
      };

      if (!budgetId) {
        // CREATE
        const { data } = await createBudget({
          variables: { input: inputData },
        });
        if (data?.createBudget?.id) {
          setBudgetId(data.createBudget.id);
          setBudgetTotalCost(data.createBudget.laborCost);
          alert("Budget criado com sucesso!");
        } else {
          alert("Falha ao criar o Budget.");
        }
      } else {
        // UPDATE
        const updateInput = {
          description,
          totalCost: inputData.totalCost,
          budgetServices: inputData.budgetServices,
        };
        const { data } = await updateBudget({
          variables: { budgetId, input: updateInput },
        });
        if (data?.updateBudget?.id) {
          alert("Budget atualizado com sucesso!");
        } else {
          alert("Falha ao atualizar o Budget.");
        }
      }
    } catch (err) {
      console.error("Erro ao salvar o Budget:", err);
      alert("Erro ao salvar o Budget");
    }
  }

  // =========================================================================
  //                              RENDER
  // =========================================================================
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 bg-gray-100 dark:bg-gray-900 h-screen flex flex-col transition-colors rounded-md shadow-lg animate__animated animate__fadeIn">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {/* Display Name of the other chat participant */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {isProfessional ? clientName : professionalName || "Carregando..."}
          </h1>
          {/* Optional: Add online status indicator here */}
        </div>
        {/* Close Conversation Button */}
        <button
          onClick={handleCloseConversation}
          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors text-sm flex items-center space-x-1"
          title="Sair da Conversa"
        >
          <ImExit />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {/* Main Content Area (Chat + Budget Panel) */}
      <div className="flex-1 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 overflow-hidden animate__animated animate__fadeInUp">
        {/* Chat Column */}
        <div className="md:flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden shadow-inner h-full max-h-[calc(100vh-150px)] md:max-h-full">
          {" "}
          {/* Adjusted max-h */}
          {/* Message List Area */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 justify-end">
            {" "}
            {/* Vertical spacing */}
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === userId;
              return (
                <div
                  key={msg.id ?? `msg-${idx}`} // Prefer message ID for key
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`} // Align message bubble
                >
                  <div
                    className={`max-w-[75%] lg:max-w-[65%] px-1 ${
                      isMe ? "" : ""
                    }`}
                  >
                    {" "}
                    {/* Bubble container */}
                    {/* Show sender name only for messages from others */}
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                        {getSenderName(msg)}
                      </p>
                    )}
                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-lg shadow-sm transition-all duration-300 ${
                        isMe
                          ? "bg-orange-500 text-white" // Sent by me
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100" // Received
                      } relative`}
                    >
                      {/* Message Content */}
                      <p className="whitespace-pre-wrap text-sm break-words">
                        {msg.content}
                      </p>
                      {/* Timestamp and Read Status */}
                      <div
                        className={`text-xs mt-1.5 flex items-center space-x-1.5 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {isMe && getReadIcon(msg)}{" "}
                        {/* Read icon for own messages */}
                        <span
                          className={`opacity-80 ${
                            isMe
                              ? "text-orange-100 dark:text-orange-200"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {/* Format timestamp */}
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>
          {/* Typing Indicator Area */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 italic px-4 py-2 border-t dark:border-gray-700 shrink-0">
              {" "}
              {/* shrink-0 prevents collapse */}
              <TiMessageTyping
                size={20}
                className="mr-2 animate-pulse text-orange-500"
              />
              {Object.values(typingUsers).join(", ")} está digitando...
            </div>
          )}
          {/* Message Input Area */}
          <div className="border-t border-gray-300 dark:border-gray-700 p-3 flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 shrink-0">
            {" "}
            {/* Input area fixed at bottom */}
            {/* Text Input */}
            <textarea
              className="flex-1 h-12 min-h-[48px] max-h-24 resize-none bg-gray-100 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-gray-700 dark:text-gray-200 text-sm"
              placeholder="Digite sua mensagem..."
              value={content}
              rows={1} // Start with 1 row, can auto-grow with CSS/JS if needed
              onKeyDown={(e) => {
                // Emit typing start event
                if (socketConnected) {
                  getSocket().emit("typingStart", {
                    conversationId: chatId,
                    userId,
                  });
                }
                // Send message on Enter (unless Shift is pressed)
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
                // Reset typing stop timer
                emitTypingStopRef.current.cancel();
              }}
              onKeyUp={() => {
                // Start typing stop timer only if input has content
                if (content.trim()) {
                  emitTypingStopRef.current();
                } else {
                  if (socketConnected) {
                    getSocket().emit("typingStop", {
                      conversationId: chatId,
                      userId,
                    });
                  }
                } // Stop immediately if empty
              }}
              onBlur={() => {
                // Stop typing if input loses focus
                if (socketConnected) {
                  getSocket().emit("typingStop", {
                    conversationId: chatId,
                    userId,
                  });
                }
              }}
              onChange={(e) => {
                setContent(e.target.value);
                // Stop typing immediately if input becomes empty
                if (!e.target.value.trim() && socketConnected) {
                  getSocket().emit("typingStop", {
                    conversationId: chatId,
                    userId,
                  });
                }
              }}
            />
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!content.trim()} // Disable if input is empty
              className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Enviar Mensagem"
            >
              <IoSend size={20} />
            </button>
            {/* Budget Panel Toggle Button (for Professionals) */}
            {isProfessional && (
              <button
                className={`text-white px-3 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-1 text-sm shrink-0 ${
                  showBudgetPanel ? "bg-orange-600" : "bg-orange-500"
                }`}
                onClick={() => setShowBudgetPanel(!showBudgetPanel)}
                title={
                  showBudgetPanel
                    ? "Fechar Painel de Orçamento"
                    : "Abrir Painel de Orçamento"
                }
              >
                <FaEdit />
                {/* Optional: Add text label like "Orçamento" */}
                {/* <span className="hidden sm:inline">{showBudgetPanel ? "Fechar" : "Orçamento"}</span> */}
              </button>
            )}
          </div>
        </div>

        {/* SIDE PANEL DO BUDGET */}
        {isProfessional && showBudgetPanel && (
          <div className="w-full md:w-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4 flex flex-col animate__animated animate__fadeInRight">
            <h2 className="text-lg font-bold mb-3 text-center text-gray-700 dark:text-gray-200">
              Orçamento
            </h2>

            {needsLoading ? (
              <p className="text-sm text-gray-500">Carregando Needs...</p>
            ) : needsError ? (
              <p className="text-sm text-red-500">Erro ao carregar as Needs</p>
            ) : (
              <div className="mb-4">
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Selecione a Need
                </label>
                <select
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                  value={selectedNeedId ?? ""}
                  onChange={async (e) => {
                    const needId = Number(e.target.value);
                    await handleSelectNeed(needId);
                  }}
                >
                  <option value="">-- Escolha uma Need --</option>
                  {needsData?.needsByChatId?.map((nd: Need) => (
                    <option key={nd.id} value={nd.id}>
                      {nd.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exibe o total calculado a partir dos valores individuais dos serviços */}
            <div className="mb-4">
              <div className="flex flex-row justify-between items-center">
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
                  Total do Valor dos Serviços
                </label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
                  R${" "}
                  {budgetServices
                    .reduce(
                      (acc, cur) => acc + (Number(cur.serviceValue) || 0),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>

            {/* Observações */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              className="w-full p-2 mb-4 rounded border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione observações aqui..."
            />

            {/* Seção de Serviços */}
            <div className="relative group mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Cadastrar serviços:
                </span>
                <button
                  onClick={handleAddServiceItem}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <IoMdAddCircle size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border-t pt-2">
              {budgetServices.map((bs, idx) => (
                <div key={idx} className="mb-3 border-b pb-2">
                  {/* Tarefa */}
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Atividade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pintar parede..."
                    className="w-full mt-1 mb-2 p-1 border rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                    value={bs.task}
                    onChange={(e) =>
                      setBudgetServices((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? {
                                ...item,
                                task: e.target.value,
                                serviceValue: Number(item.serviceValue),
                              }
                            : item
                        )
                      )
                    }
                  />

                  {/* Quantidade, Unidade e Valor do Serviço */}
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                        value={bs.quantity}
                        onChange={(e) =>
                          setBudgetServices((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, quantity: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Unidade de Medida
                      </label>
                      <select
                        className="p-1 border rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                        value={bs.unitOfMeasurementId}
                        onChange={(e) =>
                          setBudgetServices((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? {
                                    ...item,
                                    unitOfMeasurementId: Number(e.target.value),
                                  }
                                : item
                            )
                          )
                        }
                      >
                        <option value={0}>Selecione</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id} title={u.description}>
                            {u.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Novo campo: Valor do Serviço */}
                  <div className="mb-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Valor do Serviço
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                      placeholder="Ex: 150.00"
                      value={bs.serviceValue}
                      onChange={(e) =>
                        setBudgetServices((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? {
                                  ...item,
                                  serviceValue: Number(e.target.value),
                                }
                              : item
                          )
                        )
                      }
                    />
                  </div>

                  {/* Botão Remover */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemoveServiceItem(idx)}
                      className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                    >
                      <MdDeleteForever size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão Salvar */}
            <button
              onClick={handleSaveBudget}
              className="mt-4 w-full py-2 bg-orange-600 text-white rounded justify-self-end hover:bg-orange-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}