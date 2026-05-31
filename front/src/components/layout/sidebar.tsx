"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItemsFor } from "@/lib/rbac";
import { useAuth } from "@/lib/auth-context";
import { Icon, type IconName } from "@/components/ui/icon";
import styles from "./sidebar.module.css";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  if (!user) return null;
  const items = navItemsFor(user.role);

  // 현재 경로에 매칭되는 메뉴 중 가장 구체적인(가장 긴) href 하나만 활성 처리.
  // 예: /me/password 에서 /me 와 /me/password 가 동시에 매칭되는 문제 방지.
  const activeHref = items
    .map((i) => i.href)
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoBadge}>재</span>
        <span className={styles.logoText}>재필 ERP</span>
      </div>

      <nav className={styles.nav}>
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link key={item.href} href={item.href} className={cn(styles.item, active && styles.active)}>
              <Icon name={item.icon as IconName} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button onClick={signOut} className={styles.logout}>
          <Icon name="log-out" size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
