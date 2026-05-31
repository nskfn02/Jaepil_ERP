"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import styles from "./credential-box.module.css";

/** 임시 비밀번호 표시 + 복사 (직원 등록 완료·비밀번호 초기화 결과) */
export function CredentialBox({ label, value, tone = "success" }: { label: string; value: string; tone?: "success" | "neutral" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className={cn(styles.box, tone === "success" ? styles.success : styles.neutral)}>
      <div className={styles.texts}>
        <span className={cn(styles.label, tone === "success" ? styles.successLabel : styles.neutralLabel)}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <Button variant="secondary" size="sm" onClick={copy}>
        {copied ? "복사됨" : "복사"}
      </Button>
    </div>
  );
}
