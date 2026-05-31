import { cn } from "@/lib/utils";
import styles from "./spinner.module.css";

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(styles.spinner, className)}
      aria-label="로딩 중"
      role="status"
    >
      <circle cx="12" cy="12" r="9" className={styles.track} />
      <path d="M21 12a9 9 0 0 0-9-9" className={styles.head} />
    </svg>
  );
}
