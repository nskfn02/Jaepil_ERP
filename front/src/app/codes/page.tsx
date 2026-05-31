"use client";

import { useCallback, useEffect, useState } from "react";
import { codeApi, ApiError } from "@/lib/api";
import type { CodeType, CommonCode } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { InfiniteLoader } from "@/components/ui/infinite-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import styles from "./codes.module.css";

const PAGE_SIZE = 20;

export default function CodesPage() {
  const toast = useToast();
  const [codes, setCodes] = useState<CommonCode[] | null>(null);
  const loading = codes === null;
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CommonCode | null>(null);
  const [codeType, setCodeType] = useState<CodeType>("department");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CommonCode | null>(null);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    codeApi.list().then((res) => {
      setCodes(res);
      // 현재 노출 개수는 유지하되, 최소 한 페이지·최대 전체 건수로 보정
      setVisible((v) => Math.min(Math.max(v, PAGE_SIZE), Math.max(PAGE_SIZE, res.length)));
    });
  }, []);

  useEffect(() => load(), [load]);

  const openCreate = () => {
    setEditing(null);
    setCodeType("department");
    setCode("");
    setName("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (c: CommonCode) => {
    setEditing(c);
    setCodeType(c.codeType);
    setCode(c.code);
    setName(c.name);
    setFormError(null);
    setFormOpen(true);
  };

  const submitForm = async () => {
    setFormError(null);
    if (!editing && !code.trim()) { setFormError("코드값을 입력하세요."); return; }
    if (!name.trim()) { setFormError("명칭을 입력하세요."); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await codeApi.update(editing.id, name.trim());
        toast.show("코드가 수정되었습니다.");
      } else {
        await codeApi.create({ codeType, code: code.trim().toUpperCase(), name: name.trim() });
        toast.show("코드가 등록되었습니다.");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = async (c: CommonCode) => {
    const refs = await codeApi.refCount(c.id);
    if (refs > 0) {
      setBlockMessage(`이 코드를 참조하는 직원이 ${refs}명 있습니다. 해당 직원들의 부서/직급을 먼저 변경한 뒤 다시 시도하세요.`);
      return;
    }
    setDeleteTarget(c);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await codeApi.remove(deleteTarget.id);
      toast.show("코드가 삭제되었습니다.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteTarget(null);
      if (err instanceof ApiError && err.code === "REFERENCED") {
        setBlockMessage(err.message);
      } else {
        toast.show("삭제 중 오류가 발생했습니다.", "error");
      }
    }
  };

  const list = codes ?? [];
  const pageItems = list.slice(0, visible);
  const hasMore = visible < list.length;
  const loadMore = useCallback(() => setVisible((v) => Math.min(v + PAGE_SIZE, list.length)), [list.length]);

  return (
    <AppShell title="공통 코드">
      <div className={styles.page}>
        <PageHeader
          title="공통 코드"
          description="부서·직급 코드를 등록하고 관리합니다"
          action={<Button onClick={openCreate}><Icon name="plus" size={16} />코드 등록</Button>}
        />

        {loading ? (
          <Table>
            <THead><TR><TH>유형</TH><TH>코드값</TH><TH>명칭</TH><TH align="right">관리</TH></TR></THead>
            <TBody>{Array.from({ length: 8 }).map((_, i) => <TR key={i}>{Array.from({ length: 4 }).map((__, j) => <TD key={j}><Skeleton className={styles.skCell} /></TD>)}</TR>)}</TBody>
          </Table>
        ) : (
          <>
            <Table>
              <THead><TR><TH>유형</TH><TH>코드값</TH><TH>명칭</TH><TH align="right">관리</TH></TR></THead>
              <TBody>
                {pageItems.map((c) => (
                  <TR key={c.id} className={styles.row}>
                    <TD><Badge variant={c.codeType === "department" ? "info" : "neutral"}>{c.codeType === "department" ? "부서" : "직급"}</Badge></TD>
                    <TD className={styles.code}>{c.code}</TD>
                    <TD>{c.name}</TD>
                    <TD align="right">
                      <div className={styles.actions}>
                        <button onClick={() => openEdit(c)} className={styles.iconBtn} aria-label="수정">
                          <Icon name="edit" size={16} />
                        </button>
                        <button onClick={() => requestDelete(c)} className={cn(styles.iconBtn, styles.deleteBtn)} aria-label="삭제">
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <InfiniteLoader
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={false}
              endLabel={`총 ${list.length}건`}
              showEnd={list.length > 0}
            />
          </>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `${editing.codeType === "department" ? "부서" : "직급"} 코드 수정` : "코드 등록"}
        width={460}
        footer={<><Button variant="ghost" onClick={() => setFormOpen(false)}>취소</Button><Button onClick={submitForm} loading={submitting}>{editing ? "수정" : "등록"}</Button></>}
      >
        <div className={styles.form}>
          {formError && <div className={styles.formError}>{formError}</div>}
          <FormField label="유형" required>
            <Select
              options={[{ value: "department", label: "부서" }, { value: "position", label: "직급" }]}
              value={codeType}
              onChange={(e) => setCodeType(e.target.value as CodeType)}
              disabled={!!editing}
            />
          </FormField>
          <FormField label="코드값" required hint={editing ? "코드값은 변경할 수 없습니다 (불변)" : "영문 대문자로 입력 (예: DEV)"}>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="DEV" disabled={!!editing} />
          </FormField>
          <FormField label="명칭" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="개발팀" />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="이 코드를 삭제하시겠습니까?"
        message={`${deleteTarget?.codeType === "department" ? "부서" : "직급"} 코드 '${deleteTarget?.name}(${deleteTarget?.code})'을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        danger
      />

      <Modal
        open={!!blockMessage}
        onClose={() => setBlockMessage(null)}
        width={460}
        footer={<Button onClick={() => setBlockMessage(null)}>확인</Button>}
      >
        <div className={styles.blockRow}>
          <span className={styles.blockIcon}>
            <Icon name="alert" size={20} />
          </span>
          <div>
            <h2 className={styles.blockTitle}>삭제할 수 없습니다</h2>
            <p className={styles.blockDesc}>{blockMessage}</p>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
