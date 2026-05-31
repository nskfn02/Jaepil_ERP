"use client";

import { useCallback, useEffect, useState } from "react";
import { accountApi, ApiError } from "@/lib/api";
import type { CredentialResult, EmployeeView, Role } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { InfiniteLoader } from "@/components/ui/infinite-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RadioGroup } from "@/components/ui/radio";
import { CredentialBox } from "@/components/ui/credential-box";
import styles from "./accounts.module.css";

const PAGE_SIZE = 20;

export default function AccountsPage() {
  const toast = useToast();
  const [items, setItems] = useState<EmployeeView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [target, setTarget] = useState<EmployeeView | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState<Role>("USER");
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [resetResult, setResetResult] = useState<{ name: string; cred: CredentialResult } | null>(null);

  // 페이지 단위 조회 — append=false면 첫 페이지 로드, true면 이어붙이기(무한 스크롤)
  const fetchPage = useCallback(async (targetPage: number, append: boolean) => {
    if (append) setLoadingMore(true);
    try {
      const res = await accountApi.list(targetPage, PAGE_SIZE);
      setTotal(res.total);
      setPage(targetPage);
      setItems((prev) => (append ? [...prev, ...res.items] : res.items));
    } finally {
      if (append) setLoadingMore(false);
      setFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (reloading || loadingMore) return;
    fetchPage(page + 1, true);
  }, [reloading, loadingMore, page, fetchPage]);

  const hasMore = items.length < total;

  // 변경 작업 후 현재까지 로드된 범위를 다시 불러와 목록 갱신 (스크롤 위치/로드 범위 유지)
  const reload = useCallback(async () => {
    setReloading(true);
    try {
      const count = Math.max(PAGE_SIZE, items.length);
      const res = await accountApi.list(1, count);
      setTotal(res.total);
      setItems(res.items);
      setPage(Math.max(1, Math.ceil(res.items.length / PAGE_SIZE)));
    } finally {
      setReloading(false);
    }
  }, [items.length]);

  const onToggleActive = async (emp: EmployeeView, next: boolean) => {
    if (!next) {
      setTarget(emp);
      setDeactivateOpen(true);
      return;
    }
    try {
      await accountApi.setActive(emp.id, true);
      toast.show("계정이 활성화되었습니다.");
      reload();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  const confirmDeactivate = async () => {
    if (!target) return;
    try {
      await accountApi.setActive(target.id, false);
      toast.show("계정이 비활성화되었습니다.");
      setDeactivateOpen(false);
      setTarget(null);
      reload();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  const confirmRole = async () => {
    if (!target) return;
    try {
      await accountApi.changeRole(target.id, roleDraft);
      toast.show("역할이 변경되었습니다.");
      setRoleOpen(false);
      setTarget(null);
      reload();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  const resetPassword = async (emp: EmployeeView) => {
    try {
      const cred = await accountApi.resetPassword(emp.id);
      setResetResult({ name: emp.name, cred });
      reload();
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.", "error");
    }
  };

  return (
    <AppShell title="계정 관리">
      <div className={styles.page}>
        <div className={styles.head}>
          <h2 className={styles.title}>계정 관리</h2>
          <p className={styles.subtitle}>로그인 계정의 역할과 활성 상태를 관리합니다</p>
        </div>

        {firstLoad ? (
          <Table>
            <THead><TR><TH>사번</TH><TH>이름</TH><TH>역할</TH><TH>계정 상태</TH><TH align="right">관리</TH></TR></THead>
            <TBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TR key={i}>{Array.from({ length: 5 }).map((__, j) => <TD key={j}><Skeleton className={styles.skCell} /></TD>)}</TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <>
            <Table>
              <THead><TR><TH>사번</TH><TH>이름</TH><TH>역할</TH><TH>계정 상태</TH><TH align="right">관리</TH></TR></THead>
              <TBody>
                {items.map((e) => (
                  <TR key={e.id} className={styles.row}>
                    <TD className={styles.empNo}>{e.employeeNumber}</TD>
                    <TD>{e.name}</TD>
                    <TD><Badge variant={e.role === "ADMIN" ? "admin" : "user"}>{e.role === "ADMIN" ? "관리자" : "일반"}</Badge></TD>
                    <TD>
                      <div className={styles.statusCell}>
                        <Switch checked={e.isActive} disabled={e.employmentStatus === "resigned"} onChange={(next) => onToggleActive(e, next)} label="계정 활성" />
                        <span className={styles.statusLabel}>{e.isActive ? "활성" : "비활성"}</span>
                      </div>
                    </TD>
                    <TD align="right">
                      <DropdownMenu
                        actions={[
                          { label: "역할 변경", icon: "shield", onClick: () => { setTarget(e); setRoleDraft(e.role); setRoleOpen(true); } },
                          { label: "비밀번호 초기화", icon: "key", onClick: () => resetPassword(e) },
                        ]}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <InfiniteLoader
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={loadingMore}
              endLabel={`총 ${total}명`}
            />
          </>
        )}
      </div>

      <Modal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="역할 변경"
        width={440}
        footer={<><Button variant="ghost" onClick={() => setRoleOpen(false)}>취소</Button><Button onClick={confirmRole}>변경</Button></>}
      >
        <p className={styles.modalDesc}>{target?.name}({target?.employeeNumber}) 님의 계정 역할을 변경합니다.</p>
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

      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => { setDeactivateOpen(false); setTarget(null); }}
        onConfirm={confirmDeactivate}
        title="계정을 비활성화하시겠습니까?"
        message="비활성화하면 해당 사용자는 로그인할 수 없습니다. 인사 이력은 보존되며 다시 활성화할 수 있습니다."
        confirmLabel="비활성화"
      />

      <Modal
        open={!!resetResult}
        onClose={() => setResetResult(null)}
        width={460}
        footer={<Button onClick={() => setResetResult(null)}>확인</Button>}
      >
        <h2 className={styles.resetTitle}>비밀번호가 초기화되었습니다</h2>
        <p className={styles.resetDesc}>{resetResult?.name}({resetResult?.cred.employeeNumber}) 님의 새 임시 비밀번호입니다. 사용자에게 전달하세요.</p>
        <div className={styles.resetBox}><CredentialBox label="임시 비밀번호" value={resetResult?.cred.temporaryPassword ?? ""} /></div>
        <p className={styles.resetNote}>첫 로그인 시 비밀번호 변경이 필요합니다.</p>
      </Modal>
    </AppShell>
  );
}
