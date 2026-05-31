"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";
import styles from "./dropdown-menu.module.css";

export interface MenuAction {
  label: string;
  icon?: IconName;
  onClick: () => void;
  danger?: boolean;
}

export function DropdownMenu({ actions, ariaLabel = "행 액션" }: { actions: MenuAction[]; ariaLabel?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label={ariaLabel} aria-haspopup="menu" aria-expanded={open} className={styles.trigger}>
        <Icon name="more" size={18} />
      </button>
      {open && (
        <div role="menu" className={styles.menu}>
          {actions.map((a) => (
            <button
              key={a.label}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                a.onClick();
              }}
              className={cn(styles.item, a.danger && styles.danger)}
            >
              {a.icon && <Icon name={a.icon} size={15} />}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
