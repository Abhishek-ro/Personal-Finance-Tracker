"use client";

import * as React from "react";
import { nanoid } from "nanoid";
import { atom, useAtom } from "jotai";

type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  variant?: "default" | "destructive";
};

const toastsAtom = atom<Toast[]>([]);

export const useToast = () => {
  const [toasts, setToasts] = useAtom(toastsAtom);



 
  const toast = React.useCallback(
    (props: Omit<Toast, "id">) => {
      const id = nanoid();
      setToasts((prev) => [...prev, { id, ...props }]);
    },
    [setToasts]
  );

  const dismiss = React.useCallback(
    (toastId?: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    },
    [setToasts]
  );

  const update = React.useCallback(
    (toastId: string, props: Omit<Toast, "id">) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === toastId ? { ...t, ...props } : t))
      );
    },
    [setToasts]
  );

  return {
    toasts,
    toast,
    dismiss,
    update,
  };
};
