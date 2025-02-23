"use client";

import React from "react";
import Pricing from "../../../components/orcamento/Pricing";

const PricingPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Precificação</h1>
      <Pricing />
    </div>
  );
};

export default PricingPage;
