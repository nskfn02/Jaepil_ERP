"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { employeeApi } from "@/lib/api";
import type { EmployeeView } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoRow } from "@/components/ui/info-row";
import styles from "./me.module.css";

export default function MyInfoPage() {
  const { user } = useAuth();
  const [emp, setEmp] = useState<EmployeeView | null>(null);
  const loading = !emp;

  useEffect(() => {
    if (!user) return;
    let active = true;
    employeeApi.get(user.id).then((e) => {
      if (active) setEmp(e);
    });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <AppShell title="내 인사정보">
      <div className={styles.page}>
        <div className={styles.head}>
          <h2 className={styles.title}>내 인사정보</h2>
          <p className={styles.subtitle}>본인의 인사 정보입니다 (읽기 전용)</p>
        </div>

        <Card className={styles.card}>
          {loading || !emp ? (
            <div className={styles.loadingWrap}>
              <div className={styles.loadingHead}>
                <Skeleton className={styles.skAvatar} />
                <div className={styles.loadingTexts}>
                  <Skeleton className={styles.skLine32} />
                  <Skeleton className={styles.skLine48} />
                </div>
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className={styles.skRow} />
              ))}
            </div>
          ) : (
            <>
              <div className={styles.userCard}>
                <Avatar name={emp.name} size={48} />
                <div className={styles.userMeta}>
                  <div className={styles.userNameRow}>
                    <span className={styles.userName}>{emp.name}</span>
                    <Badge variant={emp.employmentStatus === "active" ? "active" : "resigned"}>
                      {emp.employmentStatus === "active" ? "재직" : "퇴사"}
                    </Badge>
                  </div>
                  <span className={styles.userSub}>
                    {emp.employeeNumber} · {emp.departmentName} · {emp.positionName}
                  </span>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>기본 정보</h3>
                <div className={styles.grid}>
                  <InfoRow label="이름" value={emp.name} />
                  <InfoRow label="사번" value={emp.employeeNumber} />
                  <InfoRow label="부서" value={emp.departmentName} />
                  <InfoRow label="직급" value={emp.positionName} />
                  <InfoRow label="입사일" value={emp.hireDate} />
                  <InfoRow label="연락처" value={emp.phone ?? "-"} />
                  <InfoRow label="역할" value={<Badge variant={emp.role === "ADMIN" ? "admin" : "user"}>{emp.role === "ADMIN" ? "관리자" : "일반"}</Badge>} />
                  <InfoRow label="재직상태" value={<Badge variant={emp.employmentStatus === "active" ? "active" : "resigned"}>{emp.employmentStatus === "active" ? "재직" : "퇴사"}</Badge>} />
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
