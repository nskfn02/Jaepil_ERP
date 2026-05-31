"use client";

import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import styles from "./toast.module.css";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className={styles.viewport}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast} role="status" onClick={() => dismiss(t.id)}>
          <span className={cn(styles.dot, styles[t.kind])} />
          <span className={styles.message}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
