import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import styles from "./checkbox.module.css";

export function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(styles.checkbox, checked && styles.checked, disabled && styles.disabled, className)}
    >
      {checked && <Icon name="check" size={12} />}
    </button>
  );
}
