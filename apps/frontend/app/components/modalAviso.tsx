// src/components/modalAviso.tsx

import React from "react";

interface ModalProps {
  title: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  loading = false,
  children,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 max-w-md transform transition-transform duration-300 scale-100">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        
        {/* Renderiza children se fornecido, caso contrário, renderiza description */}
        {children ? (
          children
        ) : (
          <>
            <p className="mb-6">{description}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition transform hover:scale-105"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition transform hover:scale-105"
                disabled={loading}
              >
                {loading ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
