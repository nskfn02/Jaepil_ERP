"use client";

import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import styles from "./topbar.module.css";

export function Topbar({ title }: { title: string }) {
  const { user } = useAuth();
  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <button className={styles.bell} aria-label="알림">
          <Icon name="bell" size={20} />
        </button>
        <Avatar name={user?.name} size={32} />
      </div>
    </header>
  );
}
