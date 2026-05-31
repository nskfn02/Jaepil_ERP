import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import styles from "./select.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

export function Select({ options, placeholder, invalid, className, value, ...props }: SelectProps) {
  return (
    <div className={styles.wrap}>
      <select
        value={value}
        className={cn(styles.select, !value && placeholder && styles.placeholder, invalid && styles.invalid, className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className={styles.option}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={16} className={styles.chevron} />
    </div>
  );
}
