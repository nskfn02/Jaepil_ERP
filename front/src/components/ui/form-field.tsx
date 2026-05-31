import { cn } from "@/lib/utils";
import { Label } from "./label";
import styles from "./form-field.module.css";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, htmlFor, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? <p className={styles.error}>{error}</p> : hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}
