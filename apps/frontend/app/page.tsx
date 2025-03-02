"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useContext } from "react";
import { useQuery } from "@apollo/client";
import { GET_RANDOM_PORTFOLIOS, GET_TOP_SERVICES } from "./graphql/queries";
import Hero from "./components/Hero";
import PortfolioCard from "./components/PortfolioCard";
import SkeletonLoader from "./components/SkeletonLoader";
import { AuthContext } from "./components/AuthContext";

export default function Page() {
  const { user, isAuthenticated } = useContext(AuthContext);

  const loggedIn = isAuthenticated;
  const role = user?.role;

  const {
    data: portfoliosData,
    loading: loadingPort,
    error: errorPort,
  } = useQuery(GET_RANDOM_PORTFOLIOS, {
    skip: !loggedIn || role !== "CLIENT",
  });

  const { data: servicesData, loading: loadingServ } = useQuery(
    GET_TOP_SERVICES,
    {
      skip: !loggedIn || role !== "CLIENT",
    }
  );

  return (
    <div className="container mx-auto ">
    
      {!loggedIn && (
        <section className="flex flex-col justify-center items-center">
          <h2 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-tertiary">
            Serviços em Destaque
          </h2>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-8">
            {loadingServ || !servicesData?.length ? (
              <SkeletonLoader className="w-[12rem] h-[12rem]" count={9} />
            ) : (
              servicesData.topServices.map((service: any) => (
                <PortfolioCard
                  key={service.id}
                  name={service.name}
                  description="Descrição do serviço"
                  profileLink={`/service/${service.id}`}
                  images={service.images}
                  rating={service.rating}
                />
              ))
            )}
          </div>
        </section>
      )}

      {loggedIn && role === "CLIENT" && (
        <section className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-tertiary">
            Serviços em Destaque
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {loadingPort || !portfoliosData?.getRandomPortfolios?.length ? (
              <SkeletonLoader className="w-[19rem] h-[18rem]" count={9} />
            ) : (
              portfoliosData?.getRandomPortfolios.map((portfolio: any) => (
                <PortfolioCard
                  key={portfolio.id}
                  name={portfolio.title}
                  description={portfolio.description}
                  profileLink={`/dashboard/profile/${portfolio.professionalId}`}
                  images={portfolio.images || []}
                  rating={user?.rating || 0}
                />
              ))
            )}
          </div>
        </section>
      )}

      {loggedIn && role === "PROFESSIONAL" && (
        <section className="container mx-auto ">
          <h2 className="text-2xl pl-10 font-bold text-gray-800 dark:text-tertiary">
            Seus Projetos Recentes
          </h2>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10">
            {loadingPort || !portfoliosData?.length ? (
              <SkeletonLoader className="w-[19rem] h-[18rem]" count={15} />
            ) : (
              portfoliosData?.map((professional: any) => (
                <PortfolioCard
                  key={professional.id}
                  name={professional.name}
                  description="Descrição do serviço"
                  profileLink={`/profile/${professional.id}`}
                  images={professional.portfolioImages}
                  rating={professional.rating}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
