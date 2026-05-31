"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { employeeApi, accountApi, ApiError } from "@/lib/api";
import type { CredentialResult, EmployeeView, Role } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { AppShell } from "@/components/layout/app-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { InfoRow } from "@/components/ui/info-row";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { RadioGroup } from "@/components/ui/radio";
import { CredentialBox } from "@/components/ui/credential-box";
import styles from "./detail.module.css";

type Tab = "basic" | "account";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [emp, setEmp] = useState<EmployeeView | null>(null);
  const loading = !emp;
  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "account" ? "account" : "basic");

  const [resignOpen, setResignOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<Role>("USER");
  const [resetResult, setResetResult] = useState<CredentialResult | null>(null);

  const load = useCallback(() => {
    employeeApi.get(id).then((e) => {
      setEmp(e);
      setRoleDraft(e.role);
    });
  }, [id]);

  useEffect(() => load(), [load]);

  const handleResign = async () => {
    try {
      await employeeApi.resign(id);
      toast.show("퇴사 처리되었습니다.");
      setResignOpen(false);
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDeactivate = async () => {
    try {
      await accountApi.setActive(id, false);
      toast.show("계정이 비활성화되었습니다.");
      setDeactivateOpen(false);
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleActivate = async () => {
    try {
      await accountApi.setActive(id, true);
      toast.show("계정이 활성화되었습니다.");
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleRoleChange = async () => {
    try {
      await accountApi.changeRole(id, roleDraft);
      toast.show("역할이 변경되었습니다.");
      setRoleOpen(false);
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await accountApi.resetPassword(id);
      setResetResult(res);
      load();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  return (
    <AppShell title="직원 상세">
      <div className={styles.page}>
        <Breadcrumb items={[{ label: "직원 관리", href: "/employees" }, { label: emp?.name ?? "직원" }]} />

        <div className={styles.header}>
          {loading || !emp ? (
            <div className={styles.loadingHead}>
              <Skeleton className={styles.skAvatar} />
              <div className={styles.loadingTexts}>
                <Skeleton className={styles.skName} />
                <Skeleton className={styles.skSub} />
              </div>
            </div>
          ) : (
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
          )}
          {emp && (
            <Button variant="secondary" onClick={() => router.push(`/employees/${id}/edit`)}>
              <Icon name="edit" size={16} />
              수정
            </Button>
          )}
        </div>

        <Tabs
          items={[
            { value: "basic", label: "기본정보" },
            { value: "account", label: "계정" },
          ]}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
        />

        {tab === "basic" && (
          <Card className={styles.card}>
            <h3 className={styles.cardTitle}>기본 정보</h3>
            {loading || !emp ? (
              <div className={styles.grid}>
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className={styles.skRow} />)}
              </div>
            ) : (
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
            )}
          </Card>
        )}

        {tab === "account" && emp && (
          <Card className={styles.card}>
            <h3 className={styles.cardTitle}>계정 설정</h3>
            <div className={styles.accountList}>
              <SettingRow
                title="역할"
                desc="계정의 접근 권한 범위 (일반 ↔ 관리자)"
                control={
                  <>
                    <Badge variant={emp.role === "ADMIN" ? "admin" : "user"}>{emp.role === "ADMIN" ? "관리자" : "일반"}</Badge>
                    <Button variant="secondary" size="sm" onClick={() => { setRoleDraft(emp.role); setRoleOpen(true); }}>역할 변경</Button>
                  </>
                }
              />
              <SettingRow
                title="계정 상태"
                desc="비활성화하면 로그인이 차단됩니다 (인사 이력 보존)"
                control={
                  <>
                    <Badge variant={emp.isActive ? "active" : "neutral"}>{emp.isActive ? "활성" : "비활성"}</Badge>
                    {emp.isActive ? (
                      <Button variant="secondary" size="sm" onClick={() => setDeactivateOpen(true)} disabled={emp.employmentStatus === "resigned"}>비활성화</Button>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={handleActivate} disabled={emp.employmentStatus === "resigned"}>활성화</Button>
                    )}
                  </>
                }
              />
              <SettingRow
                title="비밀번호"
                desc="임시 비밀번호를 발급해 사용자에게 전달"
                control={<Button variant="secondary" size="sm" onClick={handleResetPassword}>비밀번호 초기화</Button>}
              />
              {emp.employmentStatus === "active" && (
                <div className={styles.dangerZone}>
                  <div className={styles.dangerTexts}>
                    <span className={styles.dangerTitle}>퇴사 처리</span>
                    <span className={styles.dangerDesc}>재직 → 퇴사로 변경. 계정이 즉시 비활성화되며 복직(재활성화)할 수 없습니다.</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setResignOpen(true)}>퇴사 처리</Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={resignOpen}
        onClose={() => setResignOpen(false)}
        onConfirm={handleResign}
        title="퇴사 처리하시겠습니까?"
        message={`${emp?.name ?? ""}(${emp?.employeeNumber ?? ""}) 님을 퇴사 처리합니다. 계정이 즉시 비활성화되며 복직(재활성화)할 수 없습니다.`}
        confirmLabel="퇴사 처리"
        danger
      />

      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="계정을 비활성화하시겠습니까?"
        message="비활성화하면 해당 사용자는 로그인할 수 없습니다. 인사 이력은 보존되며 다시 활성화할 수 있습니다."
        confirmLabel="비활성화"
      />

      <Modal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="역할 변경"
        width={440}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRoleOpen(false)}>취소</Button>
            <Button onClick={handleRoleChange}>변경</Button>
          </>
        }
      >
        <p className={styles.modalDesc}>{emp?.name}({emp?.employeeNumber}) 님의 계정 역할을 변경합니다.</p>
        <RadioGroup
          name="role"
          value={roleDraft}
          onChange={(v) => setRoleDraft(v as Role)}
          options={[
            { value: "USER", label: "일반", description: "본인 인사정보·계정만 관리" },
            { value: "ADMIN", label: "관리자", description: "전체 데이터·시스템 설정 접근" },
          ]}
        />
      </Modal>

      <Modal
        open={!!resetResult}
        onClose={() => setResetResult(null)}
        width={460}
        footer={<Button onClick={() => setResetResult(null)}>확인</Button>}
      >
        <h2 className={styles.resetTitle}>비밀번호가 초기화되었습니다</h2>
        <p className={styles.resetDesc}>{emp?.name}({resetResult?.employeeNumber}) 님의 새 임시 비밀번호입니다. 사용자에게 전달하세요.</p>
        <div className={styles.resetBox}>
          <CredentialBox label="임시 비밀번호" value={resetResult?.temporaryPassword ?? ""} />
        </div>
        <p className={styles.resetNote}>첫 로그인 시 비밀번호 변경이 필요합니다.</p>
      </Modal>
    </AppShell>
  );
}

function SettingRow({ title, desc, control }: { title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingTexts}>
        <span className={styles.settingTitle}>{title}</span>
        <span className={styles.settingDesc}>{desc}</span>
      </div>
      <div className={styles.settingControl}>{control}</div>
    </div>
  );
}
