import { cn } from "@/lib/utils";
import styles from "./table.module.css";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(styles.wrap, className)}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className={styles.thead}>{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn(styles.tr, className)}>{children}</tr>;
}

export function TH({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return <th className={cn(styles.th, styles[align], className)}>{children}</th>;
}

export function TD({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return <td className={cn(styles.td, styles[align], className)}>{children}</td>;
}
