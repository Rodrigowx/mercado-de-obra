"use client";

import React from "react";
import { MdOutlineClose } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Modal Genérico para exibir conteúdo no centro da tela
 * com fundo escuro transparente.
 */
export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-sm w-[90%] max-w-xl relative shadow-lg">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
        >
          <MdOutlineClose size={24} />
        </button>

        {/* Conteúdo do modal */}
        {children}
      </div>
    </div>
  );
}
