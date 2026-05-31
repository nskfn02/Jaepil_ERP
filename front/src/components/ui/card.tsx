import { cn } from "@/lib/utils";
import styles from "./card.module.css";

export function Card({
  variant = "flat",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "flat" | "elevated" }) {
  return (
    <div className={cn(styles.card, variant === "elevated" && styles.elevated, className)} {...props}>
      {children}
    </div>
  );
}
