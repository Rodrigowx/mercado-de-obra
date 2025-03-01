"use client";

import React, { useContext, useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PROFESSIONAL } from "../../../graphql/queries";
import { CREATE_NEED } from "../../../graphql/mutations"; // Ajuste o caminho/nome da sua mutation
import { AuthContext } from "@/app/components/AuthContext";
import { FaShareSquare, FaRegHeart, FaHammer, FaStar } from "react-icons/fa";
import { useServicesContext } from "../../../components/ServicesContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import { createConversation } from "@/app/services/chatService";
import {
  connectSocket,
  isSocketReady,
  joinConversation,
  sendMessageSocket,
} from "@/app/services/socketServices";
import router from "next/router";

interface Professional {
  id: number;
  createdAt: string;
  profileImage: string | null;
  rating: number;
  user: {
    name: string;
  };
  portfolios: Portfolio[];
}

interface Portfolio {
  id: number;
  title: string;
  description: string;
  serviceId: number;
  images: string[];
}

export default function ProfessionalProfilePage({
  params,
}: {
  params: { professionalId: number };
}) {
  const { services, getServiceById } = useServicesContext();

  const { professionalId } = params;
  const { user, isAuthenticated } = useContext(AuthContext);

  // States principais
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );

  // Estados usados para criar Need
  const [needTitle, setNeedTitle] = useState("");
  const [needDescription, setNeedDescription] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [clientNeed, setClientNeed] = useState<string>(""); // Mensagem via socket

  // Controle de conversa/socket
  const [conversationId, setConversationId] = useState<string>("");
  const [sending, setSending] = useState(false);

  // Mutation para criar Need
  const [createNeedMutation] = useMutation(CREATE_NEED);

  // Query para buscar o profissional
  const { data, loading, error } = useQuery(GET_PROFESSIONAL, {
    variables: { id: Number(professionalId) },
    onCompleted: (data) => {
      setProfessional(data.getProfessionalByUserId);
      setPortfolios(data.getProfessionalByUserId.portfolios);
      setSelectedPortfolio(data.getProfessionalByUserId.portfolios[0] || null);
    },
  });

  // Verifica se o formulário está completo
  const isFormValid = useMemo(() => {
    return (
      needTitle.trim() &&
      needDescription.trim() &&
      selectedServiceId &&
      clientNeed.trim()
    );
  }, [needTitle, needDescription, selectedServiceId, clientNeed]);

  if (loading) {
    return (
      <div className="flex justify-center items-start mt-10 h-screen">
        {/* Spinner ou algo de carregando */}
      </div>
    );
  }

  if (error) {
    console.error("Erro ao buscar profissional:", error);
    return <p>Profissional não encontrado.</p>;
  }

  const handleSendNeed = async () => {
    // console.log("Início do handleSendNeed");
    try {
      if (sending) {
        // console.log("Envio duplicado detectado. Abortando a função.");
        return;
      }
      setSending(true);

      // Verifica autenticação e existência do profissional
      if (!isAuthenticated) {
        // console.log("Usuário não autenticado. Redirecionando para /login.");
        router.push("/login");
        return;
      }
      if (!professional) {
        console.error("Profissional não encontrado.");
        alert("Profissional não encontrado");
        return;
      }

      // 1) Verifica ou cria a conversa
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        // console.log("Nenhuma conversa existente. Criando nova conversa...");
        try {
          const conversation = await createConversation(
            Number(user?.id),
            Number(professionalId),
            user?.name || "Cliente",
            professional.user.name
          );
          currentConversationId = conversation.id;
          setConversationId(currentConversationId);
          // console.log("Conversa criada com sucesso. ID:", currentConversationId);
        } catch (convErr) {
          console.error("Erro ao criar conversa:", convErr);
          alert("Erro ao criar a conversa. Tente novamente.");
          return;
        }
      } else {
        // console.log("Conversa já existente. ID:", currentConversationId);
      }

      // Validação do currentConversationId
      if (!currentConversationId || currentConversationId.trim() === "") {
        console.error("currentConversationId inválido após a criação.");
        alert("Erro: conversationId inválido!");
        return;
      }

      // Aguarda 1,5 segundo para garantir que o conversationId esteja disponível
      // console.log("Aguardando 1500ms para garantir reconhecimento do conversationId...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 2) Cria a Need, se os dados estiverem preenchidos
      if (needTitle && needDescription && selectedServiceId) {
        // console.log("Criando Need com os seguintes dados:", {
        //   title: needTitle,
        //   description: needDescription,
        //   clientId: Number(user?.id),
        //   professionalId: Number(professionalId),
        //   chatId: currentConversationId, // usa a variável local consistente
        //   serviceId: selectedServiceId,
        // });
        try {
          const mutationResponse = await createNeedMutation({
            variables: {
              input: {
                title: needTitle,
                description: needDescription,
                clientId: Number(user?.id),
                professionalId: Number(professionalId),
                chatId: currentConversationId, // garante o uso do ID correto
                serviceId: selectedServiceId,
              },
            },
          });
          const createdNeedId = mutationResponse.data?.createNeed?.id ?? null;
          // console.log(
          //   "Need criada com sucesso. ID da Need:",
          //   createdNeedId,
          //   "para a conversa:",
          //   currentConversationId
          // );
        } catch (needErr) {
          console.error("Erro ao criar Need:", needErr);
          alert("Erro ao criar a Need. Verifique os dados e tente novamente.");
          return;
        }
      } else {
        console.error("Dados insuficientes para criar a Need. Detalhes:", {
          needTitle,
          needDescription,
          selectedServiceId,
        });
      }

      // 3) Conecta ao socket, junta-se à conversa e envia a mensagem
      // console.log("Verificando a conexão do socket...");
      if (!isSocketReady() && isAuthenticated) {
        // console.log("Socket não está pronto. Conectando...");
        connectSocket(Number(user?.id));
      }
      try {
        const isInConversation = await joinConversation(
          currentConversationId,
          Number(user?.id)
        );
        // console.log("Resultado de joinConversation:", isInConversation);
        if (isInConversation && clientNeed.trim()) {
          // console.log(
          //   "Enviando mensagem via socket para a conversa:",
          //   currentConversationId,
          //   "Mensagem:",
          //   clientNeed
          // );
          sendMessageSocket(
            currentConversationId,
            Number(user?.id),
            clientNeed
          );
          setClientNeed("");
        } else {
          console.error("Falha ao entrar na conversa ou mensagem vazia.");
        }
      } catch (socketErr) {
        console.error(
          "Erro ao conectar/juntar à conversa ou enviar mensagem:",
          socketErr
        );
      }

      // Limpa os campos do formulário
      // console.log("Limpando os campos do formulário.");
      setNeedTitle("");
      setNeedDescription("");
      setSelectedServiceId(null);
    } catch (err) {
      console.error("Erro geral no handleSendNeed:", err);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setSending(false);
      // console.log("Finalização do handleSendNeed. Estado sending:", false);
    }
  };

  // Filtra serviços do profissional (sem repetições)
  const uniqueServiceIds = Array.from(
    new Set(portfolios.map((p) => p.serviceId))
  );
  const professionalServices = services.filter((s) =>
    uniqueServiceIds.includes(s.id)
  );

  return (
    <section className="container mx-auto px-4 md:px-16">
      <div className="flex flex-row justify-between items-baseline">
        {/* Nome / Cabeçalho */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {professional?.user?.name || "Profissional"}
        </h1>
        {/* Botões de compartilhar / salvar */}
        <div className="flex flex-row justify-between items-center">
          <button className="flex items-center hover:text-primary space-x-2 transition-colors duration-300">
            <FaShareSquare />
            <span className="underline underline-offset-2">Compartilhar</span>
          </button>
          <button className="flex items-center hover:text-primary space-x-2 ml-4 transition-colors duration-300">
            <FaRegHeart />
            <span className="underline underline-offset-2">Salvar</span>
          </button>
        </div>
      </div>

      <div className="mt-3">
        {/* 1) SLIDE + LISTA DE PORTFÓLIOS */}
        <div className="flex flex-col md:flex-row w-full gap-2 rounded-lg overflow-hidden shadow-lg">
          {/* SLIDE PRINCIPAL */}
          <div className="md:w-1/2 md:h-[32rem] h-[20rem]">
            {selectedPortfolio?.images?.length ? (
              <Swiper
                key={selectedPortfolio.id}
                spaceBetween={1}
                slidesPerView={1}
                className="object-cover w-full h-full overflow-hidden rounded-s-lg"
                navigation
                pagination={{ clickable: true }}
                modules={[Navigation, Pagination]}
              >
                {selectedPortfolio.images.map((imageUrl, index) => (
                  <SwiperSlide key={`image-${index}`}>
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl}
                        alt={`Imagem do portfólio de ${professional?.user?.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 700px"
                        className="object-cover"
                        priority
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-white text-xl bg-gray-700 rounded-s-lg">
                Selecione um portfólio ao lado
              </div>
            )}
          </div>

          {/* LISTA / GRID DE PORTFÓLIOS */}
          <div className="md:w-1/2 md:h-[32rem] h-[20rem]">
            <div className="h-full overflow-hidden hover:overflow-y-auto scrollbar">
              <div className="grid grid-flow-row grid-cols-2 gap-2 w-full">
                {portfolios.length > 0 ? (
                  portfolios.map((portfolio, index) => {
                    const isSelected = selectedPortfolio?.id === portfolio.id;
                    const isRightColumn = index % 2 !== 0; // segunda coluna

                    return (
                      <div
                        key={portfolio.id}
                        className={
                          "relative h-[11rem] sm:h-[13rem] w-full cursor-pointer flex items-end justify-center overflow-hidden transition-all duration-300 " +
                          (isRightColumn ? "rounded-r-lg " : "") +
                          (isSelected ? "" : "hover:brightness-110")
                        }
                        onClick={() => setSelectedPortfolio(portfolio)}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 z-10 text-orange-600 text-xl rounded-md">
                            <FaHammer />
                          </span>
                        )}

                        <Image
                          src={
                            portfolio.images?.[0] || "/images/placeholder.jpg"
                          }
                          alt={`Miniatura de ${portfolio.title}`}
                          fill
                          className="object-cover blur-sm scale-110 inset-0"
                          quality={25}
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                        <div className="relative z-10 w-full bg-black/30 text-center py-2">
                          <span className="text-base font-semibold text-white">
                            {portfolio?.title} -{" "}
                            {getServiceById(portfolio?.serviceId)?.icon}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[13rem] bg-gray-900 border flex items-center justify-center"
                      >
                        <p className="text-white">Sem portfólios</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2) TÍTULO / DESCRIÇÃO DO PORTFÓLIO SELECIONADO */}
        {selectedPortfolio && (
          <div className="mt-4 flex flex-col gap-1">
            <h2 className="text-2xl font-semibold">
              {selectedPortfolio.title}
            </h2>
            <h3 className="text-lg pl-1 text-gray-700 dark:text-gray-200">
              {selectedPortfolio.description}
            </h3>
          </div>
        )}

        {/* 3) PARTE INFERIOR: CARD DE PERFIL E FORM */}
        {/* Ajustamos para ocupar a tela de forma que não passe de 100vh */}
        <hr className="w-full border-t border-neutral-300 dark:border-neutral-600 my-1" />

        <div
          className="
            mt-3
            flex
            flex-col md:flex-row
            items-start
            gap-5
            h-[calc(100vh-12rem)]
          "
        >
          {/* CARTÃO DO PROFISSIONAL E SERVIÇOS */}
          {professional && (
            <div className="flex flex-col gap-4 w-full md:w-1/3 lg:w-1/4 xl:w-1/5">
              {/* Foto / Nome / Rating */}
              <div className="flex px-5 py-3 gap-4 rounded-lg shadow-md dark:bg-zinc-600 bg-white transition-all duration-300 items-start justify-stretch">
                <div className="relative flex-shrink-0 w-16 h-16">
                  <Image
                    src={professional.profileImage || "/default-image.jpg"}
                    alt={`Foto de perfil de ${professional.user.name}`}
                    fill
                    className="rounded-full object-cover"
                    quality={75}
                  />
                </div>
                <div className="flex flex-col items-start justify-center">
                  <div className="flex flex-row items-baseline justify-start gap-2">
                    <span className="text-lg font-semibold">
                      {professional?.user?.name.split(" ")[0]}
                    </span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 text-sm" />
                      <span className="text-sm ml-1">
                        {Number.isNaN(Number(professional?.rating))
                          ? "0.0"
                          : Number(professional?.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm">
                    Desde{" "}
                    {professional?.createdAt
                      ? new Date(professional.createdAt).getFullYear()
                      : "?"}
                  </span>
                </div>
              </div>

              {/* Lista de serviços */}
              <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2 transition-all duration-300">
                {portfolios.map((portfolio) => {
                  const service = getServiceById(portfolio?.serviceId);
                  return (
                    <div
                      key={portfolio.id}
                      className="flex pr-1 pl-2 rounded bg-primary shadow-md hover:translate-y-1 transition-transform justify-center items-center gap-1"
                    >
                      <span className="text-lg">{service?.icon}</span>
                      <span className="text-base text-white">
                        {service?.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FORMULÁRIO: CRIAR NEED + MENSAGEM */}
          <div
            className="
              w-full
              md:flex-1
              bg-white
              dark:bg-zinc-600
              rounded-lg
              shadow-md
              flex
              flex-col
              transition-all
              duration-300
              overflow-hidden
            "
          >
            {/* Cabeçalho fixo (Título + Botão Enviar) */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-500 bg-white dark:bg-zinc-600 sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Descreva sua necessidade
              </h3>
              <button
                onClick={handleSendNeed}
                disabled={!isFormValid || sending}
                className={`px-3 py-1 rounded-lg text-white transition-colors duration-300 ${
                  !isFormValid || sending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"
                }`}
              >
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </div>

            {/* Conteúdo rolável do formulário */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar">
              {/* Grid 2 colunas: (Título + Serviço) em uma linha, (Descrição + Mensagem) em outra */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Título da Need */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    className="p-2 border rounded-lg dark:bg-zinc-700 dark:text-white"
                    placeholder="Ex: Construção de muro"
                    value={needTitle}
                    onChange={(e) => setNeedTitle(e.target.value)}
                  />
                </div>

                {/* Serviço */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Serviço
                  </label>
                  <select
                    className="p-2 border rounded-lg dark:bg-zinc-700 dark:text-white"
                    value={selectedServiceId ?? ""}
                    onChange={(e) =>
                      setSelectedServiceId(Number(e.target.value))
                    }
                  >
                    <option value="">Selecione</option>
                    {professionalServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.icon}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descrição da Need */}
                <div className="flex flex-col md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="p-2 border rounded-lg dark:bg-zinc-700 dark:text-white"
                    placeholder="Explique em detalhes o que você precisa"
                    value={needDescription}
                    onChange={(e) => setNeedDescription(e.target.value)}
                  />
                </div>

                {/* Mensagem (que vai via socket) */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    className="p-2 border rounded-lg dark:bg-zinc-700 dark:text-white"
                    rows={2}
                    placeholder="Digite a mensagem para o profissional"
                    value={clientNeed}
                    onChange={(e) => setClientNeed(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="w-full border-t border-neutral-300 dark:border-neutral-600 my-1" />
      </div>
    </section>
  );
}
