"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { GET_PORTFOLIOS, GET_SERVICES } from "../../graphql/queries";
import {
  REMOVE_PORTFOLIO,
  UPDATE_PORTFOLIO,
  CREATE_PORTFOLIO_WITH_IMAGES,
} from "../../graphql/mutations";
import SkeletonLoader from "../SkeletonLoader";
import Modal from "../modalAviso";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

interface Service {
  id: number;
  name: string;
  icon: string;
}

interface Portfolio {
  id: number;
  title: string;
  description: string;
  serviceId: number;
  professionalId: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
}

interface CrudPortfolioProps {
  professionalId: number;
}


const CrudPortfolio: React.FC<CrudPortfolioProps> = ({ professionalId }) => {
  // ------------------ ESTADOS GERAIS ------------------
  const [portfolioToRemove, setPortfolioToRemove] = useState<Portfolio | null>(
    null
  );
  const [portfolioToEdit, setPortfolioToEdit] = useState<Portfolio | null>(
    null
  );

  // Controles de exibição de modais
  const [showModal, setShowModal] = useState<boolean>(false); // Modal de remover
  const [showEditModal, setShowEditModal] = useState<boolean>(false); // Modal de editar
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false); // Modal de criar

  // Mensagens e Erros
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Serviço selecionado (ao criar)
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // Portfólio selecionado visualmente (para destacar o card)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );

  // Estado para dados do novo portfólio
  const [newPortfolio, setNewPortfolio] = useState<{
    title: string;
    description: string;
  }>({
    title: "",
    description: "",
  });

  // **Arquivos Selecionados** (para criação e edição)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ------------------ APOLLO: QUERIES ------------------
  const {
    loading: servicesLoading,
    data: servicesData,
    error: servicesError,
  } = useQuery(GET_SERVICES, {
    fetchPolicy: "network-only",
  });

  const {
    loading,
    data,
    error: queryError,

  } = useQuery(GET_PORTFOLIOS, {
    variables: { professionalId },
    skip: !professionalId,
  });

  // ------------------ APOLLO: MUTATIONS ------------------
  const [removePortfolioMutation, { loading: removeLoading }] = useMutation(
    REMOVE_PORTFOLIO,
    {
      onCompleted: () => {
        setSuccessMessage("Portfólio removido com sucesso!");
        setShowModal(false);
        setPortfolioToRemove(null);
        setSelectedPortfolio(null); // Desfazer seleção
      },
      onError: (err) =>
        setError(err.message || "Erro ao remover portfólio. Tente novamente."),
      refetchQueries: [
        { query: GET_PORTFOLIOS, variables: { professionalId } },
      ],
    }
  );

  const [updatePortfolioMutation, { loading: updateLoading,  error: updateError }] = useMutation(
    UPDATE_PORTFOLIO,
    {
      onCompleted: () => {
        setSuccessMessage("Portfólio atualizado com sucesso!");
        setShowEditModal(false);
        setPortfolioToEdit(null);
        setSelectedPortfolio(null); // Desfazer seleção
      },
      onError: (err) =>
        
        setError(
          err.message || "Erro ao atualizar portfólio. Tente novamente."
        ),
      refetchQueries: [
        { query: GET_PORTFOLIOS, variables: { professionalId } },
      ],
    }
  );

  /**
   * A Mutation UNIFICADA: Cria o portfólio e sobe as imagens.
   * Renomeei a loading para createWithImagesLoading, para não conflitar com outra
   */
  const [createPortfolioWithImages, { loading: createWithImagesLoading }] =
    useMutation(CREATE_PORTFOLIO_WITH_IMAGES, {
      onCompleted: () => {
        setSuccessMessage("Portfólio criado com sucesso!");
        setShowCreateModal(false);
        setNewPortfolio({ title: "", description: "" });
        setSelectedService(null);
        setSelectedFiles([]);
      },
      onError: (err) => {
        setError(err.message || "Erro ao criar portfólio. Tente novamente.");
      },
      refetchQueries: [
        { query: GET_PORTFOLIOS, variables: { professionalId } },
      ],
    });

  // ------------------ USE EFFECTS: LIMPAR MENSAGENS ------------------
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ------------------ FUNÇÕES DE AÇÃO ------------------
  const handleRemovePortfolio = () => {
    if (!portfolioToRemove) return;
    removePortfolioMutation({
      variables: { userId: professionalId, id: portfolioToRemove.id },
    });
  };

  // EDITAR (atualiza título/descrição e faz upload de novas imagens, se houver)
  const handleUpdatePortfolio = async (updatedData:any) => {
    if (!portfolioToEdit) return;

    // 1. Atualiza dados de texto do portfólio
    try {
      await updatePortfolioMutation({
        variables: {
          professionalId: professionalId,
          id: portfolioToEdit.id,
          input: updatedData,
        },
      });

    } catch (err: any) {
      setError(err.message || "Erro ao atualizar portfólio. Tente novamente.");
      
    }
  };

  useEffect(() => {
    console.log("eiei", updateError);
  }, [updateError]);

  // CRIAR - agora usando a mutation UNIFICADA
  const handleCreatePortfolioWithImages = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
  
    if (!selectedService) {
      setError("Nenhum serviço selecionado.");
      return;
    }
  
    if (selectedFiles.length < 1) {
      setError("Selecione ao menos 1 imagem para criar o portfólio.");
      return;
    }
  
    if (selectedFiles.length > 6) {
      setError("Você pode enviar no máximo 6 imagens.");
      return;
    }
  
    try {
  
      await createPortfolioWithImages({
        variables: {
          professionalId,
          input: {
            title: newPortfolio.title,
            description: newPortfolio.description,
            serviceId: selectedService,
            images: selectedFiles,
          },
        },
      });
      console.log("Portfólio criado com sucesso!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao criar portfólio. Tente novamente.");
    }
  };
  

  // ------------------ TRATAMENTO DE ERROS DAS QUERIES ------------------
  if (queryError || servicesError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 animate-fade-in">
          {queryError
            ? `Erro ao buscar portfólios: ${queryError.message}`
            : `Erro ao buscar serviços: ${servicesError?.message}`}
        </div>
      </div>
    );
  }

  // Verifica se professionalId está definido
  if (!professionalId) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 animate-fade-in">
          Por favor, faça login novamente.
        </div>
      </div>
    );
  }

  // Tratamento de Carregamento
  if (loading || servicesLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <SkeletonLoader
          className="w-full h-48 rounded-lg animate-pulse"
          count={3}
        />
      </div>
    );
  }

  // Mapeamento dos Serviços para Facilitar a Busca
  const servicesMap: { [key: number]: Service } = {};
  servicesData?.services.forEach((service: Service) => {
    servicesMap[service.id] = service;
  });

  // ------------------ RENDER PRINCIPAL ------------------
  return (
    <div className="mx-auto px-4 py-6">
      <div className="mb-4 grid grid-cols-3 items-center">
        {/* Coluna Esquerda: Título */}
        <div className="text-left">
          <h2 className="text-2xl font-bold">Portfólios:</h2>
        </div>

        {/* Coluna Central: Botões Editar e Remover */}
        <div className="flex justify-center space-x-4">
          {selectedPortfolio && (
            <>
              <button
                onClick={() => {
                  setPortfolioToEdit(selectedPortfolio);
                  setShowEditModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition transform hover:scale-105"
              >
                <FaEdit className="mr-2" /> Editar
              </button>
              <button
                onClick={() => {
                  setPortfolioToRemove(selectedPortfolio);
                  setShowModal(true);
                }}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition transform hover:scale-105"
              >
                <FaTrash className="mr-2" /> Remover
              </button>
            </>
          )}
        </div>

        {/* Coluna Direita: Botão Adicionar */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
          >
            <FaPlus className="mr-2" /> Adicionar
          </button>
        </div>
      </div>

      {/* Exibir portfólios */}
      {data?.getPortfolios?.length === 0 ? (
        <div className="bg-gray-200 text-gray-700 p-6 rounded-lg text-center animate-fade-in">
          Nenhum portfólio cadastrado. Comece agora!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.getPortfolios.map((portfolio: Portfolio) => {
            const service = servicesMap[portfolio.serviceId];

            return (
              <div
                className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 ${
                  selectedPortfolio?.id === portfolio.id
                    ? "border-orange-500"
                    : "border-transparent"
                } transition transform hover:scale-105 hover:shadow-lg`}
              >
                {/* Slider de Imagens */}
                {portfolio.images && portfolio.images.length > 0 ? (
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    className="w-full h-40"
                    spaceBetween={10}
                    slidesPerView={1}
                  >
                    {portfolio.images.map((imageUrl, index) => (
                      <SwiperSlide key={`image-${index}`}>
                        <Image
                          src={imageUrl} // Use diretamente o valor da string
                          alt={portfolio.title || "Imagem do portfólio"}
                          width={640}
                          height={360}
                          quality={75}
                          className="w-full h-40 object-cover transition-transform duration-300 transform hover:scale-110"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <Image
                    src="/default-image.jpg"
                    alt={portfolio.title || "Imagem padrão"}
                    width={640}
                    height={360}
                    quality={75}
                    className="w-full h-40 object-cover transition-transform duration-300 transform hover:scale-110"
                  />
                )}

                {/* Detalhes do Portfólio */}
                <div
                  className="p-4 cursor-pointer"
                  key={portfolio.id}
                  onClick={() => {
                    if (selectedPortfolio?.id === portfolio.id) {
                      setSelectedPortfolio(null);
                    } else {
                      setSelectedPortfolio(portfolio);
                    }
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {portfolio.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {portfolio.description}
                  </p>
                  {service && (
                    <div className="flex justify-end items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>{service.icon}</span>
                      <span className="ml-2">{service.name}</span>
                    </div>
                  )}
                </div>

                {/* Indicador de Seleção */}
                {selectedPortfolio?.id === portfolio.id && (
                  <div className="absolute inset-0 bg-orange-100 bg-opacity-50 pointer-events-none animate-fade-in"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação para Remover Portfólio */}
      {showModal && portfolioToRemove && (
        <Modal
          title="Confirmar Remoção"
          description={`Tem certeza que deseja remover o portfólio "${portfolioToRemove.title}"? Esta ação é irreversível.`}
          onConfirm={handleRemovePortfolio}
          onCancel={() => {
            setShowModal(false);
            setPortfolioToRemove(null);
          }}
          loading={removeLoading}
        />
      )}

      {/* Modal para Editar Portfólio */}
      {showEditModal && portfolioToEdit && (
        <Modal
          title="Editar Portfólio"
          loading={updateLoading /* ou uploadLoading, se tiver*/}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedData = {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                serviceId: portfolioToEdit.serviceId,
                images: selectedFiles,
              };
              handleUpdatePortfolio(updatedData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Título:
              </label>
              <input
                type="text"
                name="title"
                defaultValue={portfolioToEdit.title}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Descrição:
              </label>
              <textarea
                name="description"
                defaultValue={portfolioToEdit.description}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition focus:outline-none"
                required
              ></textarea>
            </div>

            {/* Input para adicionar novas imagens (opcional) */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Novas imagens (opcional, máx. 6):
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  setSelectedFiles(files);
                }}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-700"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setPortfolioToEdit(null);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition transform hover:scale-105"
                disabled={updateLoading /* ou uploadLoading */}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition transform hover:scale-105"
                disabled={updateLoading /* ou uploadLoading */}
              >
                {updateLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal para Criar Novo Portfólio (agora usando createPortfolioWithImages) */}
      {showCreateModal && (
        <Modal
          title="Cadastrar Novo Portfólio"
          loading={createWithImagesLoading /* ao invés de createLoading */}
        >
          <form
            onSubmit={handleCreatePortfolioWithImages}
            className="space-y-4"
          >
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Escolha o serviço:
              </label>
              <select
                value={selectedService || ""}
                onChange={(e) => setSelectedService(Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition"
                required
              >
                <option value="" disabled>
                  {servicesData?.services.length > 0
                    ? "Escolha um serviço..."
                    : "Nenhum serviço disponível."}
                </option>
                {servicesData?.services.map((service: Service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.icon}
                  </option>
                ))}
              </select>
              {error && !selectedService && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Título:
              </label>
              <input
                type="text"
                name="title"
                value={newPortfolio.title}
                onChange={(e) =>
                  setNewPortfolio((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Descrição:
              </label>
              <textarea
                name="description"
                value={newPortfolio.description}
                onChange={(e) =>
                  setNewPortfolio((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                required
              ></textarea>
            </div>

            {/* Input para imagens (mín. 1, máx. 6) */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Imagens (mín. 1, máx. 6):
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  setSelectedFiles(files);
                }}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-700"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPortfolio({ title: "", description: "" });
                  setSelectedService(null);
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition transform hover:scale-105"
                disabled={createWithImagesLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
                disabled={createWithImagesLoading}
              >
                <FaPlus className="mr-2" />
                {createWithImagesLoading ? "Criando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Exibição de mensagens de sucesso ou erro */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-100 text-green-700 rounded-lg shadow-lg animate-fade-in-out">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-100 text-red-700 rounded-lg shadow-lg animate-fade-in-out">
          {error}
        </div>
      )}
    </div>
  );
};

export default CrudPortfolio;
