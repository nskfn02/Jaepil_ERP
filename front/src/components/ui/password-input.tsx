"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import styles from "./password-input.module.css";

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

export function PasswordInput({ invalid, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.wrap}>
      <input type={visible ? "text" : "password"} className={cn(styles.input, invalid && styles.invalid, className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
        className={styles.toggle}
      >
        <Icon name={visible ? "eye-off" : "eye"} size={18} />
      </button>
    </div>
  );
}
