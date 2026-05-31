"use client";

import { useEffect } from "react";
import { Icon } from "./icon";
import styles from "./modal.module.css";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 460,
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  closeOnBackdrop?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.scrim} onClick={closeOnBackdrop ? onClose : undefined} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title} className={styles.dialog} style={{ maxWidth: width }}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button onClick={onClose} aria-label="닫기" className={styles.close}>
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
