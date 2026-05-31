import { cn } from "@/lib/utils";
import styles from "./textarea.module.css";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return <textarea className={cn(styles.textarea, invalid && styles.invalid, className)} {...props} />;
}
