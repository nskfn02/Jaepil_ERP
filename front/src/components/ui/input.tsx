import { cn } from "@/lib/utils";
import styles from "./input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return <input className={cn(styles.input, invalid && styles.invalid, className)} {...props} />;
}
