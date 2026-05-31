"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { canAccess } from "@/lib/rbac";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Forbidden } from "./forbidden";
import { Spinner } from "@/components/ui/spinner";
import styles from "./app-shell.module.css";

const FORCE_CHANGE_PATH = "/me/password";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.mustChangePassword && pathname !== FORCE_CHANGE_PATH) {
      router.replace(FORCE_CHANGE_PATH);
    }
  }, [user, loading, pathname, router]);

  if (loading || !user) {
    return (
      <div className={styles.center}>
        <Spinner size={24} />
      </div>
    );
  }

  if (user.mustChangePassword && pathname !== FORCE_CHANGE_PATH) {
    return (
      <div className={styles.center}>
        <Spinner size={24} />
      </div>
    );
  }

  const allowed = canAccess(pathname, user.role);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar title={allowed ? title : "접근 거부"} />
        <main className={styles.content}>{allowed ? children : <Forbidden role={user.role} />}</main>
      </div>
    </div>
  );
}
