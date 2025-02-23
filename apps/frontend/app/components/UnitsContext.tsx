"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery } from "@apollo/client";
import { ALL_UNITS } from "../graphql/queries";
import { AuthContext } from "./AuthContext";

type Unit = {
  id: number;
  code: string;
  description: string;
};

interface UnitsContextType {
  getUnitById: (id: number) => Unit | undefined;
  units: Unit[];
  loading: boolean;
  error: any;
}

const UnitsContext = createContext<UnitsContextType>({
  getUnitById: () => undefined,
  units: [],
  loading: true,
  error: null,
});

export const UnitsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [units, setUnits] = useState<Unit[]>([]);
  const { data, loading, error } = useQuery(ALL_UNITS, {
    skip: user?.role !== "PROFESSIONAL" || !isAuthenticated,
  });

  useEffect(() => {
    if (data && user?.role === "PROFESSIONAL" && isAuthenticated) {
      setUnits(data.allUnits);
    }
  }, [data, user?.role, isAuthenticated]);

  const getUnitById = (id: number) => {
    return units.find((unit) => unit.id === id);
  }; 

  useEffect(() => {
    if (user?.role == "PROFESSIONAL") {
      console.log("Units data:", data);
    }
  }, [data, isAuthenticated]);

  return (
    <UnitsContext.Provider
      value={{
        getUnitById,
        units,
        loading,
        error,
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnitsContext = () => useContext(UnitsContext);
