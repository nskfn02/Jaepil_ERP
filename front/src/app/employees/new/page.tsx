"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeApi, codeApi, ApiError } from "@/lib/api";
import type { CommonCode, CredentialResult, Role } from "@/lib/types";
import { isValidPhone } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { RadioInline } from "@/components/ui/radio";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { CredentialBox } from "@/components/ui/credential-box";
import styles from "../employee-form.module.css";

interface FormErrors {
  name?: string;
  departmentCodeId?: string;
  positionCodeId?: string;
  hireDate?: string;
  phone?: string;
  form?: string;
}

export default function EmployeeNewPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<CommonCode[]>([]);
  const [positions, setPositions] = useState<CommonCode[]>([]);

  const [name, setName] = useState("");
  const [departmentCodeId, setDepartmentCodeId] = useState("");
  const [positionCodeId, setPositionCodeId] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("USER");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ name: string; cred: CredentialResult } | null>(null);

  useEffect(() => {
    codeApi.list("department").then(setDepartments);
    codeApi.list("position").then(setPositions);
  }, []);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "이름을 입력하세요.";
    if (!departmentCodeId) e.departmentCodeId = "부서를 선택하세요.";
    if (!positionCodeId) e.positionCodeId = "직급을 선택하세요.";
    if (!hireDate) e.hireDate = "입사일을 선택하세요.";
    if (phone && !isValidPhone(phone)) e.phone = "연락처 형식이 올바르지 않습니다.";
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors({ ...e, form: "필수 입력값을 확인해 주세요." });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { credential } = await employeeApi.create({ name: name.trim(), departmentCodeId, positionCodeId, hireDate, phone: phone.trim() || undefined, role });
      setResult({ name: name.trim(), cred: credential });
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : "직원 등록 중 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="직원 등록">
      <form className={styles.form} onSubmit={onSubmit}>
        <PageHeader
          breadcrumb={<Breadcrumb items={[{ label: "직원 관리", href: "/employees" }, { label: "직원 등록" }]} />}
          title="직원 등록"
          description="인사 프로필을 입력하면 로그인 계정이 자동 생성됩니다"
          action={
            <div className={styles.headerActions}>
              <Button type="button" variant="secondary" onClick={() => router.push("/employees")}>취소</Button>
              <Button type="submit" loading={submitting}>저장</Button>
            </div>
          }
        />

        {errors.form && <Alert kind="error">{errors.form === "필수 입력값을 확인해 주세요." ? "필수 입력값을 확인해 주세요. 이름은 필수이며, 연락처 형식이 올바른지 확인하세요." : errors.form}</Alert>}

        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>기본 정보</h3>
          <div className={styles.grid}>
            <FormField label="이름" required htmlFor="name" error={errors.name}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" invalid={!!errors.name} />
            </FormField>
            <FormField label="사번" hint="등록 시 자동 채번됩니다">
              <Input value="" placeholder="2026-XXXX (자동)" disabled />
            </FormField>
            <FormField label="부서" required error={errors.departmentCodeId}>
              <Select options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="부서 선택" value={departmentCodeId} onChange={(e) => setDepartmentCodeId(e.target.value)} invalid={!!errors.departmentCodeId} />
            </FormField>
            <FormField label="직급" required error={errors.positionCodeId}>
              <Select options={positions.map((p) => ({ value: p.id, label: p.name }))} placeholder="직급 선택" value={positionCodeId} onChange={(e) => setPositionCodeId(e.target.value)} invalid={!!errors.positionCodeId} />
            </FormField>
            <FormField label="입사일" required error={errors.hireDate}>
              <DatePicker value={hireDate} onChange={setHireDate} invalid={!!errors.hireDate} placeholder="입사일 선택" />
            </FormField>
            <FormField label="연락처" error={errors.phone}>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" invalid={!!errors.phone} />
            </FormField>
          </div>

          <div className={styles.roleSection}>
            <FormField label="역할" required hint="관리자는 전체 데이터·시스템 설정에 접근할 수 있습니다">
              <div className={styles.roleControl}>
                <RadioInline
                  name="role"
                  value={role}
                  onChange={(v) => setRole(v as Role)}
                  options={[
                    { value: "USER", label: "일반" },
                    { value: "ADMIN", label: "관리자" },
                  ]}
                />
              </div>
            </FormField>
          </div>
        </Card>
      </form>

      <Modal
        open={!!result}
        onClose={() => {
          setResult(null);
          router.push("/employees");
        }}
        width={480}
        footer={<Button onClick={() => { setResult(null); router.push("/employees"); }}>확인</Button>}
      >
        <h2 className={styles.resultTitle}>직원이 등록되었습니다</h2>
        <p className={styles.resultDesc}>{result?.name} 님의 로그인 계정이 생성되었습니다. 아래 임시 비밀번호를 전달하세요.</p>
        <div className={styles.resultBoxes}>
          <CredentialBox label="로그인 사번" value={result?.cred.employeeNumber ?? ""} tone="neutral" />
          <CredentialBox label="임시 비밀번호" value={result?.cred.temporaryPassword ?? ""} tone="success" />
        </div>
        <p className={styles.resultNote}>첫 로그인 시 비밀번호 변경이 필요합니다.</p>
      </Modal>
    </AppShell>
  );
}
