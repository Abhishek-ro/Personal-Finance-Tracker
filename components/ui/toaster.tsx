"use client";

import * as React from "react";
import { useToast } from "./use-toast";
import { Toast } from "./toast";
import { AnimatePresence } from "framer-motion";

export const Toaster = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[9999] flex flex-col-reverse gap-2 p-4 sm:p-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
