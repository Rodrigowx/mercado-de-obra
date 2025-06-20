"use client";

import React, { useState, useRef, useContext, useEffect } from "react";
import {
  FaUserCircle,
  FaBars,
  FaSignOutAlt,
  FaCog,
  FaSuitcase,
  FaSearch,
  FaUserAlt,
  FaUserTie,
} from "react-icons/fa";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { AuthContext } from "./AuthContext";

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const loggedIn = isAuthenticated;
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    if (toggleTimeoutRef.current) return;
    toggleTimeoutRef.current = setTimeout(() => {
      setIsOpen((prev) => !prev);
      toggleTimeoutRef.current = null;
    }, 50);
  };

  const handleLogin = () => {
    setShowAuthModal(true);
    setModalMode("login");
    setIsOpen(false);
  };

  const handleSignup = () => {
    setShowAuthModal(true);
    setModalMode("signup");
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getUserIcon = () => {
    if (!loggedIn) {
      return (
        <FaUserCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      );
    }
    if (!user) return null;
    return user.role === "PROFESSIONAL" ? (
      <FaUserTie className="w-5 h-5 text-primary" />
    ) : (
      <FaUserAlt className="w-5 h-5 text-primary" />
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-between w-auto h-10 bg-gray-200 dark:bg-neutral-800 rounded-full shadow-md px-2 py-1 focus:outline-hidden hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        <FaBars className="pr-1 text-lg" />
        {getUserIcon()}
      </button>
      {isOpen && (
        <div
          className="absolute z-20 right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2"
          onClick={(e) => e.stopPropagation()}
        >
          {loggedIn ? (
            <>
              <div className="px-4 py-2 text-gray-800 dark:text-gray-200 font-semibold border-b border-gray-200 dark:border-gray-600">
                Olá, {user?.name || "Usuário"}
              </div>

              <a
                onClick={handleLogout}
                className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                <FaSignOutAlt className="inline mr-2" /> Sair
              </a>
              {user && user.role === "CLIENT" && (
                <>
                  <Link
                    href="/perfil"
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaCog className="inline mr-2" /> Meu Perfil
                  </Link>
                  <Link
                    href="/dashboard-client"
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaSearch className="inline mr-2" /> Buscar Profissionais
                  </Link>
                  <Link
                    href="/reservations"
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Minhas Reservas
                  </Link>
                </>
              )}
              {user && user.role === "PROFESSIONAL" && (
                <>
                  <Link
                    href="/perfil"
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaCog className="inline mr-2" /> Meu Perfil
                  </Link>
                  <Link
                    href="/dashboard/dashboard-professional/"
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaSuitcase className="inline mr-2" /> Criar Portifólio
                  </Link>
                  <Link
                    href="/dashboard/dashboard-professional/budgets"
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaSearch className="inline mr-2" /> Orçamentos
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <a
                onClick={handleLogin}
                className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                Entrar
              </a>
              <a
                onClick={handleSignup}
                className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                Cadastrar
              </a>
            </>
          )}
        </div>
      )}
      {showAuthModal && (
        <AuthModal mode={modalMode} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default UserMenu;
