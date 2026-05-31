import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";
import styles from "./empty-state.module.css";

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(styles.empty, className)}>
      <span className={styles.iconWrap}>
        <Icon name={icon} size={24} />
      </span>
      <div className={styles.texts}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.desc}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
