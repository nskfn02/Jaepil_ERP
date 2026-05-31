import { cn } from "@/lib/utils";
import styles from "./avatar.module.css";

const SIZE_CLASS = { 32: "s32", 40: "s40", 48: "s48" } as const;

export function Avatar({
  name,
  size = 40,
  className,
}: {
  name?: string | null;
  size?: 32 | 40 | 48;
  className?: string;
}) {
  const initial = name?.trim()?.[0] ?? "?";
  return (
    <span className={cn(styles.avatar, styles[SIZE_CLASS[size]], className)} aria-hidden="true">
      {initial}
    </span>
  );
}
