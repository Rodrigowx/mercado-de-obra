"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaHammer } from "react-icons/fa";
import { useQuery } from "@apollo/client";
import SkeletonLoader from "./SkeletonLoader";
import { GET_SERVICES } from "../graphql/queries";

interface SubMenuProps {
  isSearchVisible: boolean;
}

const SubMenu: React.FC<SubMenuProps> = ({ isSearchVisible }) => {
  const [services, setServices] = useState<any[]>([]);
  const { loading, error } = useQuery(GET_SERVICES, {
    onCompleted: (data) => {
      setServices(data.services);
    },
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const updateArrowsVisibility = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    updateArrowsVisibility();

    scrollContainerRef.current.addEventListener("scroll", updateArrowsVisibility);
    window.addEventListener("resize", updateArrowsVisibility);

    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener("scroll", updateArrowsVisibility);
      }
      window.removeEventListener("resize", updateArrowsVisibility);
    };
  }, [services]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex gap-2 space-x-6 justify-center items-center">
        <SkeletonLoader className="w-14 h-10 mb-7 rounded-full" count={19} />
      </div>
    );
  }

  if (error) return <div>Erro ao carregar serviços</div>;

  return (
    <div className="relative w-[80%] mx-auto pb-2 rounded-full">
      <div className="border-b border-gray-300 dark:border-gray-600 mb-4 w-[100%]"></div>

      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute self-center left-[-3rem] top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-secondary text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 z-10 w-10"
          aria-label="Scroll Left"
        >
          <FaArrowLeft />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex items-center space-x-7 overflow-x-auto scrollbar-hide rounded-2xl"
      >
        {services.map((service: any) => (
          <div
            key={service.id}
            className="flex flex-col items-center justify-center shrink-0 w-20 text-center"
          >
            <div className={`text-base ${isSearchVisible ? "text-sm" : "text-sm"}`}>
              {service.icon || <FaHammer />}
            </div>
            <span className={`mt-1 ${isSearchVisible ? "text-xs mt-0" : "text-sm"} text-gray-800 dark:text-tertiary`}>
              {service.name}
            </span>
          </div>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-[-3rem] top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-secondary text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 z-10 w-10"
          aria-label="Scroll Right"
        >
          <FaArrowRight />
        </button>
      )}
    </div>
  );
};

export default SubMenu;
