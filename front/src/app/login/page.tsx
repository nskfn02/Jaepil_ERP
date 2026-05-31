"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi, ApiError } from "@/lib/api";
import { landingFor } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, expiredReason, clearExpiry } = useAuth();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(landingFor(user.role));
  }, [user, loading, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearExpiry();
    setSubmitting(true);
    try {
      const session = await authApi.login(employeeNumber.trim(), password);
      signIn(session);
      router.replace(session.mustChangePassword ? "/me/password" : landingFor(session.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className={styles.center}>
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoBadge}>재</span>
          <span className={styles.logoText}>재필 ERP</span>
        </div>

        <div className={styles.head}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>사번과 비밀번호를 입력하세요</p>
        </div>

        {expiredReason && !error && (
          <Alert kind="info" className={styles.banner}>
            세션이 만료되어 자동 로그아웃되었습니다. 다시 로그인해 주세요.
          </Alert>
        )}

        <form className={styles.form} onSubmit={onSubmit}>
          <FormField label="사번" htmlFor="employeeNumber">
            <Input
              id="employeeNumber"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="2026-0001"
              autoComplete="username"
              invalid={!!error}
            />
          </FormField>
          <FormField label="비밀번호" htmlFor="password">
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              invalid={!!error}
            />
          </FormField>

          <Button type="submit" fullWidth loading={submitting} className={styles.submit}>
            로그인
          </Button>

          {error && <Alert kind="error">{error}</Alert>}
        </form>

        <p className={styles.demo}>
          데모 계정 — 관리자: <b>2025-0001 / admin123</b> · 일반: <b>2026-0001 / user1234</b>
        </p>
      </div>
    </div>
  );
}
