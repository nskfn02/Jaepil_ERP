"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { landingFor } from "@/lib/rbac";
import { Spinner } from "@/components/ui/spinner";
import styles from "./home.module.css";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? landingFor(user.role) : "/login");
  }, [user, loading, router]);

  return (
    <div className={styles.center}>
      <Spinner size={24} />
    </div>
  );
}
