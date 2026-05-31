import Link from "next/link";
import { Icon } from "./icon";
import styles from "./breadcrumb.module.css";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      {items.map((c, i) => (
        <span key={i} className={styles.crumb}>
          {c.href ? (
            <Link href={c.href} className={styles.link}>
              {c.label}
            </Link>
          ) : (
            <span className={styles.current}>{c.label}</span>
          )}
          {i < items.length - 1 && <Icon name="chevron-right" size={14} />}
        </span>
      ))}
    </nav>
  );
}
