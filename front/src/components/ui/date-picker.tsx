"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import styles from "./date-picker.module.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DatePicker({
  value,
  onChange,
  invalid,
  placeholder = "날짜 선택",
}: {
  value?: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = value ? new Date(value + "T00:00:00") : new Date();
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const move = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      if (m < 0) return { year: v.year - 1, month: 11 };
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: m };
    });
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(styles.trigger, invalid && styles.invalid, !value && styles.placeholder)}
      >
        {value || placeholder}
        <Icon name="calendar" size={16} className={styles.calIcon} />
      </button>
      {open && (
        <div className={styles.popover}>
          <div className={styles.navRow}>
            <button type="button" onClick={() => move(-1)} className={styles.navBtn}>
              <Icon name="chevron-left" size={16} />
            </button>
            <span className={styles.monthLabel}>
              {view.year}년 {view.month + 1}월
            </span>
            <button type="button" onClick={() => move(1)} className={styles.navBtn}>
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
          <div className={styles.grid}>
            {WEEKDAYS.map((w, i) => (
              <span key={w} className={cn(styles.weekday, i === 0 && styles.sunday)}>
                {w}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`e-${i}`} />;
              const ds = ymd(new Date(view.year, view.month, day));
              const selected = ds === value;
              return (
                <button
                  key={ds}
                  type="button"
                  onClick={() => {
                    onChange(ds);
                    setOpen(false);
                  }}
                  className={cn(styles.day, selected && styles.selected)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
