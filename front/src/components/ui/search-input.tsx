import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import styles from "./search-input.module.css";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchInput({ className, containerClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn(styles.wrap, containerClassName)}>
      <Icon name="search" size={16} className={styles.icon} />
      <input type="search" className={cn(styles.input, className)} {...props} />
    </div>
  );
}
