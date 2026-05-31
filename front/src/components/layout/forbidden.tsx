"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { landingFor } from "@/lib/rbac";
import type { Role } from "@/lib/types";
import styles from "./forbidden.module.css";

/** RBAC-1 권한부족 403 — 일반 유저의 관리자 화면 접근 차단 */
export function Forbidden({ role }: { role: Role }) {
  const router = useRouter();
  const target = landingFor(role);
  return (
    <div className={styles.forbidden}>
      <span className={styles.iconWrap}>
        <Icon name="lock" size={32} />
      </span>
      <h2 className={styles.title}>접근 권한이 없습니다 (403)</h2>
      <p className={styles.desc}>이 페이지는 관리자만 이용할 수 있습니다. 본인 인사정보 화면으로 이동해 주세요.</p>
      <Button className={styles.action} onClick={() => router.replace(target)}>
        내 인사정보로 이동
      </Button>
    </div>
  );
}
