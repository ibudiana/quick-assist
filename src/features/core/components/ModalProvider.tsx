"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";

type ModalOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  type?: "danger" | "info" | "success";
};

type ModalContextType = {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalOptions | null>(null);

  const openModal = (options: ModalOptions) => {
    setModal(options);
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleConfirm = () => {
    if (modal) {
      modal.onConfirm();
      closeModal();
    }
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {modal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${modal.type === "danger" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                >
                  <FiAlertCircle size={20} />
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors p-1"
                  title="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {modal.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {modal.message}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-5 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
              >
                {modal.cancelText || "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  modal.type === "danger"
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                }`}
              >
                {modal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
