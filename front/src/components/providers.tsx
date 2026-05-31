"use client";

import { useSyncExternalStore } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { ToastViewport } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import styles from "./providers.module.css";

const emptySubscribe = () => () => {};

/** 서버=false / 클라이언트=true. effect·setState 없이 마운트 여부 판별 */
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * 이 ERP는 로그인 기반 내부 관리 화면으로 SSR/정적 프리렌더가 이점이 없고,
 * 인증 상태가 클라이언트(localStorage)에만 존재한다.
 * 따라서 마운트 완료 후에만 앱을 렌더하여 SSR 단계에서 useAuth가 호출되지 않도록 한다.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className={styles.center}>
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <ToastViewport />
      </ToastProvider>
    </AuthProvider>
  );
}
