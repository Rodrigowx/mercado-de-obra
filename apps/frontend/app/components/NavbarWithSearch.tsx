"use client";

import React, { useEffect, useState, useContext } from "react";
import { FaSearch } from "react-icons/fa";
import OBhorizontal from "../../public/icons/m/m8.svg";
import UserMenu from "./UserMenu";
import SubMenu from "./SubMenu";
import { usePageContext } from "./PageContext";
import { AuthContext } from "./AuthContext";
import NotificationsMenu from "./NotificationsMenu";
import Link from "next/link";

export default function NavbarWithSearch() {
  const { isProfilePage, isChatPage } = usePageContext();
  const { isAuthenticated } = useContext(AuthContext);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(true);
  const [isNotificationMenuVisible, setIsNotificationMenuVisible] =
    useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setIsNotificationMenuVisible(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isProfilePage) {
      setIsSearchVisible(true);
      setIsSubMenuVisible(false);
    } else if (isChatPage) {
      setIsSearchVisible(true);
      setIsSubMenuVisible(false);
    } else {
      setIsSearchVisible(false);
      setIsSubMenuVisible(true);
    }
  }, [isProfilePage, isChatPage]);

  // Controle do efeito de scroll para esconder/exibir a barra de pesquisa e submenu
  useEffect(() => {
    if (isProfilePage || isChatPage) return;

    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY;
        const threshold = 1;

        setIsSearchVisible(scrollY > threshold);
      }, 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isProfilePage, isChatPage]);

  // Atualiza o tema da página ao mudar o estado
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(theme === "dark" ? "light" : "dark");
    root.classList.add(theme);
  }, [theme]);

  // Alternar entre os temas claro e escuro
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="sticky w-full top-0 z-50 bg-white dark:bg-darkBg shadow-md transition-all duration-300 ease-in-out">
      <nav
        className={`relative px-6 flex items-center justify-between transition-all duration-300 ease-in-out ${
          isProfilePage || isChatPage
            ? "pt-3 pb-4 container mx-auto"
            : isSearchVisible
              ? "pt-3 pb-2"
              : "pt-9 pb-3"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-start gap-3 pl-10">
          <OBhorizontal className="w-[2.5rem] md:w-[3.4rem] h-auto shadow-md" />
          <div className="relative tracking-wide  flex box-content flex-col justify-center items-start gap-0">
            <p className="absolute top-1 font-coheadline text-lg text-secondary dark:text-tertiary ">
              mercado
            </p>
            <p className="absolute top-5 text-nowrap font-coheadline text-lg text-secondary dark:text-tertiary ">
              de obra
            </p>
          </div>
        </Link>

        

        {/* Campo de Pesquisa */}
        <div
          className={`
            absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out
            ${isSearchVisible ? "top-4 opacity-100" : "top-9 opacity-100"}
            w-72 sm:w-5/12 flex items-center bg-gray-100 dark:bg-secondary rounded-xl shadow-md px-4 py-2
          `}
        >
          <input
            id="search-input"
            type="text"
            placeholder="Buscar serviços e profissionais"
            className="flex-grow placeholder:text-ellipsis placeholder:overflow-hidden placeholder:whitespace-nowrap bg-transparent outline-none text-gray-600 dark:text-gray-200 px-2 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button className="flex items-center justify-center bg-primary text-white w-8 h-8 rounded-full">
            <FaSearch className="text-base" />
          </button>
        </div>

        {/* Botões e menu do usuário */}
        <div className="flex items-center gap-3 pr-10">
          {isNotificationMenuVisible && <NotificationsMenu />}

          {/* Botão de tema (dia/noite) */}
          <button
            onClick={toggleTheme}
            className="shadow-md bg-gray-200 dark:bg-secondary text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full focus:outline-none text-lg"
          >
            {theme === "dark" ? "☀️" : "🌘"}
          </button>

          {/* Menu do usuário */}
          <UserMenu />
        </div>
      </nav>

      {isSubMenuVisible && (
        <div className="w-full transition-transform duration-300 ease-in-out">
          <SubMenu isSearchVisible={isSearchVisible} />
        </div>
      )}
    </div>
  );
}
