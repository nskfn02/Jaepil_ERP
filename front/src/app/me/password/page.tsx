"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi, ApiError } from "@/lib/api";
import { landingFor } from "@/lib/rbac";
import { useToast } from "@/lib/toast-context";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import styles from "./password.module.css";

function PasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (next.length < 8 || !/[a-zA-Z]/.test(next) || !/[0-9]/.test(next)) {
      setError("새 비밀번호는 영문·숫자를 포함해 8자 이상이어야 합니다.");
      return;
    }
    if (next !== confirm) {
      setError("새 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      await authApi.changePassword(user.id, current, next);
      updateUser({ mustChangePassword: false });
      toast.show("비밀번호가 변경되었습니다.");
      if (forced) {
        router.replace(landingFor(user.role));
      } else {
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error && <Alert kind="error">{error}</Alert>}
      <FormField label={forced ? "현재 비밀번호 (임시)" : "현재 비밀번호"} htmlFor="current">
        <PasswordInput id="current" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      </FormField>
      <FormField label="새 비밀번호" htmlFor="next" hint="영문·숫자 포함 8자 이상">
        <PasswordInput id="next" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" invalid={!!error && error.includes("새 비밀번호")} />
      </FormField>
      <FormField label="새 비밀번호 확인" htmlFor="confirm">
        <PasswordInput id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" invalid={!!error && error.includes("일치")} />
      </FormField>
      <div className={styles.actions}>
        {!forced && (
          <Button type="button" variant="ghost" onClick={() => { setCurrent(""); setNext(""); setConfirm(""); setError(null); }}>
            취소
          </Button>
        )}
        <Button type="submit" loading={submitting} fullWidth={forced}>
          {forced ? "변경하고 시작하기" : "변경"}
        </Button>
      </div>
    </form>
  );
}

export default function PasswordChangePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size={24} />
      </div>
    );
  }

  if (user?.mustChangePassword) {
    return (
      <div className={styles.forcedPage}>
        <div className={styles.forcedCard}>
          <div className={styles.logo}>
            <span className={styles.logoBadge}>재</span>
            <span className={styles.logoText}>재필 ERP</span>
          </div>
          <div className={styles.head}>
            <h1 className={styles.forcedTitle}>비밀번호 변경이 필요합니다</h1>
            <p className={styles.forcedDesc}>
              임시 비밀번호로 로그인했습니다. 보안을 위해 새 비밀번호를 설정해야 계속할 수 있습니다.
            </p>
          </div>
          <div className={styles.forcedFormWrap}>
            <PasswordForm forced />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell title="비밀번호 변경">
      <div className={styles.page}>
        <div className={styles.pageHead}>
          <h2 className={styles.title}>비밀번호 변경</h2>
          <p className={styles.subtitle}>주기적으로 비밀번호를 변경하세요</p>
        </div>
        <Card className={styles.card}>
          <PasswordForm forced={false} />
        </Card>
      </div>
    </AppShell>
  );
}
