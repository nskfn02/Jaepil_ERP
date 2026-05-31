import { cn } from "@/lib/utils";
import styles from "./radio.module.css";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export function RadioGroup({
  name,
  value,
  options,
  onChange,
  className,
}: {
  name: string;
  value: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn(styles.group, className)}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label key={o.value} className={cn(styles.option, selected && styles.selected)}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange?.(o.value)}
              className={styles.srOnly}
            />
            <span className={cn(styles.dot, selected && styles.dotSelected)}>
              {selected && <span className={styles.dotInner} />}
            </span>
            <span className={styles.texts}>
              <span className={styles.title}>{o.label}</span>
              {o.description && <span className={styles.desc}>{o.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** 인라인(가로) 라디오 — 폼 내 간단 선택용 */
export function RadioInline({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
}) {
  return (
    <div className={styles.inline}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label key={o.value} className={styles.inlineItem}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange?.(o.value)}
              className={styles.srOnly}
            />
            <span className={cn(styles.dot, selected && styles.dotSelected)} style={{ marginTop: 0 }}>
              {selected && <span className={styles.dotInner} />}
            </span>
            <span className={styles.inlineLabel}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}
