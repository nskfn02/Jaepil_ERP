import { cn } from "@/lib/utils";
import styles from "./label.module.css";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label className={cn(styles.label, className)} {...props}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
}
