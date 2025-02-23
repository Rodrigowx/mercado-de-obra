"use client";

import React, { useState } from "react";

const Pricing: React.FC = () => {
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [materialsCost, setMaterialsCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  const calculateTotalCost = () => {
    setTotalCost(hourlyRate + materialsCost);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-tertiary">
        Precificação de Mão de Obra
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300">
        Configure os valores para calcular o custo total do serviço.
      </p>
      <div className="mt-6">
        {/* Formulário de precificação */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">
              Valor por Hora (R$)
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">
              Custo dos Materiais (R$)
            </label>
            <input
              type="number"
              value={materialsCost}
              onChange={(e) => setMaterialsCost(parseFloat(e.target.value))}
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">
              Custo Total (R$)
            </label>
            <input
              type="number"
              value={totalCost}
              readOnly
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
        <button
          onClick={calculateTotalCost}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Calcular
        </button>
      </div>
    </div>
  );
};

export default Pricing;
