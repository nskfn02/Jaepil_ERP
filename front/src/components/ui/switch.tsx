import { cn } from "@/lib/utils";
import styles from "./switch.module.css";

export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(styles.switch, checked && styles.on, disabled && styles.disabled)}
    >
      <span className={cn(styles.knob, checked && styles.knobOn)} />
    </button>
  );
}
