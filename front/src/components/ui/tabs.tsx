"use client";

import { cn } from "@/lib/utils";
import styles from "./tabs.module.css";

export interface TabItem {
  value: string;
  label: string;
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn(styles.tabs, className)} role="tablist">
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(styles.tab, active && styles.active)}
          >
            {t.label}
            {active && <span className={styles.underline} />}
          </button>
        );
      })}
    </div>
  );
}
