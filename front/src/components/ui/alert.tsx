import { cn } from "@/lib/utils";
import styles from "./alert.module.css";

type Kind = "success" | "error" | "warning" | "info";

export function Alert({ kind = "info", className, children }: { kind?: Kind; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(styles.alert, styles[kind], className)} role="alert">
      {children}
    </div>
  );
}
