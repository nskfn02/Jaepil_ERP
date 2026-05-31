import styles from "./page-header.module.css";

export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
}: {
  title: string;
  description?: string;
  breadcrumb?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.header}>
      {breadcrumb}
      <div className={styles.row}>
        <div className={styles.titles}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.desc}>{description}</p>}
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}
