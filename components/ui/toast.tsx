
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils"; 

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  toast: {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    duration?: number;
    variant?: "default" | "destructive";
  };
  onDismiss?: (id: string) => void;
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, toast, onDismiss, ...props }, ref) => {
    React.useEffect(() => {
      console.log("toast.duration", toast.duration);
      if (toast) {
        const timer = setTimeout(() => {
          onDismiss?.(toast.id);
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    }, [toast.id, toast.duration, onDismiss]);

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:zoom-out-95 data-[open]:duration-300 data-[closed]:duration-150",
          toast.variant === "destructive" &&
            "border-destructive bg-destructive text-destructive-foreground",
          className
        )}
        {...props}
      >
        <div className="grid gap-1">
          {toast.title && (
            <div
              className={cn(
                "text-sm font-semibold",
                toast.variant === "destructive" && "text-destructive-foreground"
              )}
            >
              {toast.title}
            </div>
          )}
          {toast.description && (
            <div
              className={cn(
                "text-sm opacity-90",
                toast.variant === "destructive" &&
                  "text-destructive-foreground/80"
              )}
            >
              {toast.description}
            </div>
          )}
        </div>
        {toast.action}
        {onDismiss && (
          <button
            className={cn(
              "group absolute right-2 top-2 rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
              toast.variant === "destructive" &&
                "text-destructive-foreground hover:bg-destructive/10"
            )}
            onClick={() => onDismiss(toast.id)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = "Toast";
