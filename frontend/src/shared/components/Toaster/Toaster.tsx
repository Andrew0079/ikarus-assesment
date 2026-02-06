import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch, removeToast } from "../../redux";
import { Block } from "baseui/block";
import type { ToastMessage } from "../../redux/slices/ui-slice";

const bgByType: Record<ToastMessage["type"], string> = {
  success: "#0f7b0f",
  error: "#c00",
  warning: "#b8860b",
  info: "#276ef1",
};

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    timeoutRef.current = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, duration);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [toast.id, toast.duration, dispatch]);

  const handleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    dispatch(removeToast(toast.id));
  };

  return (
    <Block
      onClick={handleClose}
      role="alert"
      $style={{
        backgroundColor: bgByType[toast.type],
        color: "#fff",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        cursor: "pointer",
        maxWidth: "360px",
        fontSize: "14px",
      }}
    >
      {toast.message}
    </Block>
  );
}

export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
