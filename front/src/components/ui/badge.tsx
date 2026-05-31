import { cn } from "@/lib/utils";
import styles from "./badge.module.css";

type Variant = "active" | "resigned" | "admin" | "user" | "success" | "warning" | "error" | "info" | "neutral";

const WITH_DOT: Variant[] = ["active", "resigned"];

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {WITH_DOT.includes(variant) && <span className={styles.dot} />}
      {children}
    </span>
  );
}
