"use client";

import { useQuery } from "@apollo/client";
import { GET_SERVICES } from "../graphql/queries";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Definição do tipo do serviço para manter o código organizado
interface Service {
  id: number;
  name: string;
  icon: string; // Pode ser uma URL ou um nome de ícone
}

// Definição do tipo para o contexto
interface ServicesContextType {
  services: Service[]; // Lista de serviços disponíveis
  getServiceById: (id: number) => Service | undefined; // Método para buscar serviço pelo ID
  loading: boolean; // Estado de carregamento
}

// Criação do contexto com um valor inicial vazio
const ServicesContext = createContext<ServicesContextType>({
  services: [],
  getServiceById: () => undefined,
  loading: true,
});

// Provedor do contexto
export const ServicesProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const { loading, error, data } = useQuery(GET_SERVICES, {
    onCompleted: (data) => {
      setServices(data.services);
    },
  });

  // Função para buscar um serviço pelo ID
  const getServiceById = (id: number) => {
    return services.find((service) => service.id === id);
  };

  return (
    <ServicesContext.Provider value={{ services, getServiceById, loading }}>
      {children}
    </ServicesContext.Provider>
  );
};

// Hook personalizado para usar o contexto de serviços
export const useServicesContext = () => useContext(ServicesContext);
