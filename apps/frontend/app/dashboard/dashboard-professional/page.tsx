"use client";

import React, { useContext } from "react";
import CrudPortfolio from "../../components/crud/CrudPortfolio";
import { AuthContext } from "../../components/AuthContext";

const DashboardProfessional: React.FC = () => {
  const { user } = useContext(AuthContext);


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bem-vindo, {user?.name.split(' ')[0]}</h1>

      {/* CRUD de Portfólio */}
      <div className="mb-6">
        <CrudPortfolio professionalId={Number(user?.id)} />
      </div>

    </div>
  );
};

export default DashboardProfessional;
