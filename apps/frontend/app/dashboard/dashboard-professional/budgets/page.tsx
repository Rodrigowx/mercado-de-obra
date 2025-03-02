"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { BUDGETS_BY_PROFESSIONAL } from "@/app/graphql/queries";
import {
  UPDATE_BUDGET,
  DELETE_BUDGET,
} from "@/app/graphql/mutations";
import { AuthContext } from "@/app/components/AuthContext";
import { useUnitsContext } from "@/app/components/UnitsContext";

import { MdOutlineClose, MdDeleteForever } from "react-icons/md";
import {
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardCheck,
} from "react-icons/fa";
import { IoMdSearch, IoMdAddCircle } from "react-icons/io";
import { GiCardboardBox } from "react-icons/gi";

// Tipos do front-end
interface BudgetService {
  id: number;
  task: string;
  quantity: number;
  serviceValue?: number;
  unitOfMeasurementId: number;
  unitOfMeasurement?: {
    code: string;
    description: string;
  };
}

interface Budget {
  id: number;
  description?: string;
  status: string;
  totalCost?: number;
  createdAt?: string;
  need?: {
    id: number;
    title: string;
    serviceId: number;
  };
  client?: {
    id: number;
    user: { name: string };
  };
  budgetServices?: BudgetService[];

  // Novos campos (planejamento)
  plannedStartDate?: string; // Data prevista de início
  plannedEndDate?: string;   // Data prevista de conclusão
  recommendedInstallments?: number; // Quantas vezes é possível receber
}

export default function BudgetsPage() {
  const { user, isAuthenticated } = useContext(AuthContext);

  // Se não for Professional, não acessa
  if (!isAuthenticated || user?.role !== "PROFESSIONAL") {
    return (
      <p className="text-red-500 text-center mt-10">
        Acesso negado. Faça login como profissional.
      </p>
    );
  }
  const professionalId = user?.id || 0;

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // States de Modal
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mutation para deleção
  const [deleteBudgetMutation] = useMutation(DELETE_BUDGET, {
    refetchQueries: [
      { query: BUDGETS_BY_PROFESSIONAL, variables: { professionalId } },
    ],
    awaitRefetchQueries: true,
  });

  // Função para deletar um orçamento
  async function handleDeleteBudget(budgetId: number, e: React.MouseEvent) {
    e.stopPropagation(); // evita abrir o modal
    if (confirm("Tem certeza que deseja deletar este orçamento?")) {
      try {
        await deleteBudgetMutation({ variables: { id: budgetId } });
        alert("Orçamento deletado com sucesso!");
      } catch (error) {
        console.error(error);
        alert("Erro ao deletar orçamento.");
      }
    }
  }

  // Carregar budgets
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const { data, loading, error } = useQuery(BUDGETS_BY_PROFESSIONAL, {
    variables: { professionalId },
    skip: !professionalId,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.budgetsByProfessional) {
      setBudgets(data.budgetsByProfessional);
    }
  }, [data]);

  // Filtro de texto
  const filteredByText = budgets.filter((b) => {
    const search = searchText.toLowerCase();
    const title = b.need?.title?.toLowerCase() || "";
    const desc = b.description?.toLowerCase() || "";
    return title.includes(search) || desc.includes(search);
  });

  // Filtro status
  const filteredByStatus = statusFilter
    ? filteredByText.filter((b) => b.status === statusFilter)
    : filteredByText;

  // Filtro data
  const fullyFiltered = filteredByStatus.filter((b) => {
    if (!b.createdAt) return true;
    const created = new Date(b.createdAt);
    if (startDate) {
      const start = new Date(startDate);
      if (created < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (created > end) return false;
    }
    return true;
  });

  // Organiza em colunas
  const columns = {
    PENDING: fullyFiltered.filter((b) => b.status === "PENDING"),
    APPROVED: fullyFiltered.filter((b) => b.status === "APPROVED"),
    REJECTED: fullyFiltered.filter((b) => b.status === "REJECTED"),
    COMPLETED: fullyFiltered.filter((b) => b.status === "COMPLETED"),
  };

  function openBudgetModal(budget: Budget) {
    setSelectedBudget(budget);
    setIsModalOpen(true);
    // Evita scroll da página principal
    document.body.classList.add("overflow-hidden");
  }
  function closeBudgetModal() {
    setSelectedBudget(null);
    setIsModalOpen(false);
    document.body.classList.remove("overflow-hidden");
  }

  if (loading)
    return <p className="text-center mt-10">Carregando orçamentos...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-500">Erro: {error.message}</p>
    );

  return (
    <section className="container mx-auto px-4 py-4">
      <div className="flex flex-row items-center justify-between mb-4">
        <h1 className="text-2xl flex flex-row justify-center items-center font-bold text-gray-800 dark:text-gray-100">
          <FaClipboardCheck className="mr-2 text-primary" />
          Meus Orçamentos
        </h1>
        <GiCardboardBox className="text-2xl text-orange-400" />
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
        {/* Filtro texto */}
        <div className="relative">
          <IoMdSearch className="absolute left-2 top-2 text-gray-400" />
          <input
            type="text"
            className="border p-2 pl-8 rounded w-72 focus:outline-none focus:ring-2 
                       focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Buscar título/descrição..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {/* Filtro status */}
        <select
          className="border p-2 rounded focus:outline-none focus:ring-2 
                     focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">-- Todos os Status --</option>
          <option value="PENDING">Pendente</option>
          <option value="APPROVED">Aprovado</option>
          <option value="REJECTED">Rejeitado</option>
          <option value="COMPLETED">Concluído</option>
        </select>

        {/* Datas */}
        <div className="flex flex-row items-center pb-5 gap-5 justify-center">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-200">
              Data Início
            </label>
            <input
              type="date"
              className="border p-1 rounded focus:outline-none focus:ring-2 
                       focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 dark:text-gray-200">
              Data Fim
            </label>
            <input
              type="date"
              className="border p-1 rounded focus:outline-none focus:ring-2 
                       focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KanbanColumn
          title="Pendente"
          budgets={columns.PENDING}
          statusIcon={
            <FaHourglassHalf className="text-gray-800 inline mr-1" />
          }
          bgColor="bg-gradient-to-br from-orange-200 to-orange-200"
          onSelect={openBudgetModal}
          onDelete={handleDeleteBudget}
        />
        <KanbanColumn
          title="Aprovado"
          budgets={columns.APPROVED}
          statusIcon={<FaCheckCircle className="text-gray-800 inline mr-1" />}
          bgColor="bg-gradient-to-br from-orange-200 to-orange-100"
          onSelect={openBudgetModal}
          onDelete={handleDeleteBudget}
        />
        <KanbanColumn
          title="Rejeitado"
          budgets={columns.REJECTED}
          statusIcon={<FaTimesCircle className="text-gray-800 inline mr-1" />}
          bgColor="bg-gradient-to-br from-orange-100 to-orange-50"
          onSelect={openBudgetModal}
          onDelete={handleDeleteBudget}
        />
        <KanbanColumn
          title="Concluído"
          budgets={columns.COMPLETED}
          statusIcon={<FaCheckCircle className="text-gray-800 inline mr-1" />}
          bgColor="bg-gradient-to-br from-orange-50 to-orange-0 dark:bg-orange-200"
          onSelect={openBudgetModal}
          onDelete={handleDeleteBudget}
        />
      </div>

      {/* MODAL */}
      {isModalOpen && selectedBudget && (
        <BudgetModal
          budget={selectedBudget}
          onClose={closeBudgetModal}
          professionalId={professionalId}
        />
      )}
    </section>
  );
}

/** Coluna do Kanban */
function KanbanColumn({
  title,
  budgets,
  statusIcon,
  bgColor,
  onSelect,
  onDelete,
}: {
  title: string;
  budgets: Budget[];
  statusIcon: React.ReactNode;
  bgColor: string;
  onSelect: (b: Budget) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`${bgColor} dark:bg-gray-800 p-2 rounded h-[70vh] overflow-auto shadow-inner transition-all`}
    >
      <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-700 sticky top-0 z-10 flex items-center">
        {statusIcon}
        {title}
      </h2>
      {budgets.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Nenhum orçamento</p>
      ) : (
        budgets.map((b) => (
          <div
            key={b.id}
            className="relative bg-white dark:bg-gray-700 p-3 mb-2 rounded shadow cursor-pointer hover:shadow-lg transition-all"
            onClick={() => onSelect(b)}
          >
            {/* Botão de deleção */}
            <button
              onClick={(e) => onDelete(b.id, e)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <MdDeleteForever size={16} />
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-200 font-medium mb-1">
              Necessidade: {b.need?.title || "Sem título"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {b.description?.slice(0, 60)}...
            </p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">
              {" "}
              Total: R$ {b.totalCost ? b.totalCost.toFixed(2) : "N/A"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

/** Modal para Detalhes/Edit */
function BudgetModal({
  budget,
  onClose,
  professionalId,
}: {
  budget: Budget;
  onClose: () => void;
  professionalId: number;
}) {
  // Agora unificamos no updateBudgetMutation (em vez de updateBudgetStatus)
  const [updateBudgetMutation] = useMutation(UPDATE_BUDGET);

  // Estados locais
  const [services, setServices] = useState<BudgetService[]>([]);
  const [description, setDescription] = useState(budget.description || "");
  const [totalCost, setTotalCost] = useState(budget.totalCost || 0);
  const [status, setStatus] = useState(budget.status);

  // Novos states para planejar datas
  const [plannedStartDate, setPlannedStartDate] = useState(
    budget.plannedStartDate || ""
  );
  const [plannedEndDate, setPlannedEndDate] = useState(
    budget.plannedEndDate || ""
  );
  const [recommendedInstallments, setRecommendedInstallments] = useState(
    budget.recommendedInstallments || 1
  );

  // Carrega os services no modal
  useEffect(() => {
    if (budget.budgetServices) {
      setServices(budget.budgetServices);
    }
  }, [budget]);

  // Recalcula o total sempre que services mudar
  useEffect(() => {
    const computedTotal = services.reduce(
      (acc, svc) =>
        acc + (svc.serviceValue ? svc.quantity * svc.serviceValue : 0),
      0
    );
    setTotalCost(computedTotal);
  }, [services]);

  // Função para calcular a diferença em meses
  const calculateMonthsBetween = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);

    // se end < start, retorne pelo menos 1
    if (endDate <= startDate) return 1;

    // Cálculo simples de meses (aproximação)
    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = endDate.getMonth() - startDate.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;

    return totalMonths < 1 ? 1 : totalMonths;
  };

  // Sempre que plannedStartDate ou plannedEndDate mudarem,
  // calculamos as parcelas recomendadas
  useEffect(() => {
    const months = calculateMonthsBetween(plannedStartDate, plannedEndDate);
    setRecommendedInstallments(months);
  }, [plannedStartDate, plannedEndDate]);

  // Mutation: Salvar Update
  async function handleSaveBudget() {
    try {
      const input = {
        // campos comuns
        description,
        totalCost,
        status,
        budgetServices: services.map((svc) => ({
          task: svc.task,
          quantity: svc.quantity,
          unitOfMeasurementId: svc.unitOfMeasurementId,
          serviceValue: svc.serviceValue,
        })),

        // campos de planejamento
        plannedStartDate,
        plannedEndDate,
        recommendedInstallments,
      };

      await updateBudgetMutation({
        variables: { budgetId: budget.id, input },
        refetchQueries: [
          { query: BUDGETS_BY_PROFESSIONAL, variables: { professionalId } },
        ],
        awaitRefetchQueries: true,
      });

      alert("Orçamento atualizado com sucesso!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar o Orçamento.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-4 mt-10 rounded w-[95%] max-w-3xl relative shadow-lg transition-all">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <MdOutlineClose size={24} />
        </button>

        <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-700 dark:text-gray-100">
          Orçamento #{budget.id}
        </h3>

        {/* Campos Principais - Stack Vertical */}
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              className="border p-1 rounded dark:bg-gray-700 dark:text-gray-100 mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">Pendente</option>
              <option value="APPROVED">Aprovado</option>
              <option value="REJECTED">Rejeitado</option>
              <option value="COMPLETED">Concluído</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descrição:
              </label>
              <textarea
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-gray-100 mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {/* Custo Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custo Total (R$):
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-gray-100 mt-1"
                value={totalCost.toFixed(2)}
                readOnly
              />
            </div>
          </div>

          {/* Planejamento de datas e parcelas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data Prevista Início:
              </label>
              <input
                type="date"
                className="border p-2 rounded dark:bg-gray-700 dark:text-gray-100 mt-1 w-full"
                value={plannedStartDate}
                onChange={(e) => setPlannedStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data Prevista Término:
              </label>
              <input
                type="date"
                className="border p-2 rounded dark:bg-gray-700 dark:text-gray-100 mt-1 w-full"
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Parcelas Recomendadas:
              </label>
              <input
                type="number"
                className="border p-2 rounded dark:bg-gray-700 dark:text-gray-100 mt-1 w-full"
                value={recommendedInstallments}
                onChange={(e) =>
                  setRecommendedInstallments(Number(e.target.value))
                }
              />
              <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">
                (Baseado na diferença em meses)
              </p>
            </div>
          </div>

          {/* Informações do Cliente/Necessidade */}
          <div>
            <p className="text-sm mb-1 text-gray-600 dark:text-gray-200">
              <span className="font-semibold">Necessidade:</span>{" "}
              {budget.need?.title || "Sem título"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-200">
              <span className="font-semibold">Cliente:</span>{" "}
              {budget.client?.user?.name || "Desconhecido"}
            </p>
          </div>

          {/* Editor de Serviços */}
          <ServicesEditor services={services} setServices={setServices} />
        </div>

        {/* Rodapé Botões */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleSaveBudget}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
          >
            Salvar Update
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Editor de Lista de Serviços */
function ServicesEditor({
  services,
  setServices,
}: {
  services: BudgetService[];
  setServices: React.Dispatch<React.SetStateAction<BudgetService[]>>;
}) {
  const { units } = useUnitsContext();
  const lastInputRef = useRef<HTMLInputElement>(null);

  // Ao clicar, adiciona um novo item
  function handleAddService() {
    setServices((prev) => [
      ...prev,
      { id: 0, task: "", quantity: 0, unitOfMeasurementId: 0 },
    ]);
  }
  // Remover item
  function handleRemoveService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }
  // Editar item
  function handleChange(
    index: number,
    key: keyof BudgetService,
    value: string | number
  ) {
    setServices((prev) =>
      prev.map((svc, i) => (i === index ? { ...svc, [key]: value } : svc))
    );
  }
  // Mudar unidade via code
  function handleUnitChange(index: number, newCode: string) {
    const found = units.find((u) => u.code === newCode);
    if (!found) return;
    setServices((prev) =>
      prev.map((svc, i) =>
        i === index ? { ...svc, unitOfMeasurementId: found.id } : svc
      )
    );
  }

  // Sempre que services mudar, foca no último se houve acréscimo
  useEffect(() => {
    if (services.length && lastInputRef.current) {
      lastInputRef.current.focus();
    }
  }, [services.length]);

  return (
    <div className="border p-3 rounded bg-gray-50 dark:bg-gray-700 max-h-[35vh] overflow-y-auto mt-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">
          Serviços ({services.length})
        </h4>
        <button
          onClick={handleAddService}
          className="text-green-600 hover:text-green-800 flex items-center gap-1"
        >
          <IoMdAddCircle size={20} />
          Adicionar
        </button>
      </div>
      {services.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-300 italic">
          Nenhum serviço definido.
        </p>
      )}
      {/* GRID DE SERVIÇOS */}
      <div className="grid md:grid-cols-2 gap-4">
        {services.map((svc, idx) => {
          const currentUnit = units.find(
            (u) => u.id === svc.unitOfMeasurementId
          );
          const selectedCode = currentUnit?.code || "";
          const inputRef = idx === services.length - 1 ? lastInputRef : null;

          return (
            <div
              key={idx}
              className="p-2 rounded border dark:border-gray-600 relative"
            >
              <button
                onClick={() => handleRemoveService(idx)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <MdDeleteForever size={18} />
              </button>
              <label className="text-xs text-gray-600 dark:text-gray-300">
                Tarefa
              </label>
              <input
                type="text"
                ref={inputRef as any}
                className="w-full p-1 rounded border dark:bg-gray-600 dark:text-gray-100 text-sm mb-2"
                value={svc.task}
                onChange={(e) => handleChange(idx, "task", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-300">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-1 rounded border dark:bg-gray-600 dark:text-gray-100 text-sm"
                    value={svc.quantity}
                    onChange={(e) =>
                      handleChange(idx, "quantity", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-300">
                    Unidade
                  </label>
                  <select
                    className="w-full p-1 rounded border dark:bg-gray-600 dark:text-gray-100 text-sm"
                    value={selectedCode}
                    onChange={(e) => handleUnitChange(idx, e.target.value)}
                  >
                    <option value="">-- Selecione --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.code} title={u.description}>
                        {u.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-300">
                    Valor do Serviço:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-1 rounded border dark:bg-gray-600 dark:text-gray-100 text-sm"
                    value={svc.serviceValue}
                    onChange={(e) =>
                      handleChange(idx, "serviceValue", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
