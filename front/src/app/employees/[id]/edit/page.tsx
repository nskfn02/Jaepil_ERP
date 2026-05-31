"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeApi, codeApi, ApiError } from "@/lib/api";
import type { CommonCode, EmployeeView } from "@/lib/types";
import { isValidPhone } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { AppShell } from "@/components/layout/app-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "../../employee-form.module.css";

interface FormErrors {
  name?: string;
  hireDate?: string;
  phone?: string;
  form?: string;
}

export default function EmployeeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [emp, setEmp] = useState<EmployeeView | null>(null);
  const [departments, setDepartments] = useState<CommonCode[]>([]);
  const [positions, setPositions] = useState<CommonCode[]>([]);
  const loading = !emp;

  const [name, setName] = useState("");
  const [departmentCodeId, setDepartmentCodeId] = useState("");
  const [positionCodeId, setPositionCodeId] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    codeApi.list("department").then(setDepartments);
    codeApi.list("position").then(setPositions);
  }, []);

  useEffect(() => {
    employeeApi
      .get(id)
      .then((e) => {
        setEmp(e);
        setName(e.name);
        setDepartmentCodeId(e.departmentCodeId);
        setPositionCodeId(e.positionCodeId);
        setHireDate(e.hireDate);
        setPhone(e.phone ?? "");
      })
      .catch(() => setErrors({ form: "직원을 찾을 수 없습니다." }));
  }, [id]);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: FormErrors = {};
    if (!name.trim()) e.name = "이름을 입력하세요.";
    if (!hireDate) e.hireDate = "입사일을 선택하세요.";
    if (phone && !isValidPhone(phone)) e.phone = "연락처 형식이 올바르지 않습니다.";
    if (Object.keys(e).length > 0) {
      setErrors({ ...e, form: "필수 입력값을 확인해 주세요." });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await employeeApi.update(id, { name: name.trim(), departmentCodeId, positionCodeId, hireDate, phone: phone.trim() || undefined });
      toast.show("변경 사항이 저장되었습니다.");
      router.push(`/employees/${id}`);
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : "수정 중 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="직원 수정">
      <form className={styles.form} onSubmit={onSubmit}>
        <PageHeader
          breadcrumb={<Breadcrumb items={[{ label: "직원 관리", href: "/employees" }, { label: emp?.name ?? "직원", href: `/employees/${id}` }, { label: "수정" }]} />}
          title="직원 수정"
          description="직원 인사 정보를 수정합니다. 사번은 변경할 수 없습니다."
          action={
            <div className={styles.headerActions}>
              <Button type="button" variant="secondary" onClick={() => router.push(`/employees/${id}`)}>취소</Button>
              <Button type="submit" loading={submitting} disabled={loading}>저장</Button>
            </div>
          }
        />

        {errors.form && <Alert kind="error">{errors.form}</Alert>}

        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>기본 정보</h3>
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className={styles.skField} />)}
            </div>
          ) : (
            <div className={styles.grid}>
              <FormField label="이름" required htmlFor="name" error={errors.name}>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} />
              </FormField>
              <FormField label="사번" hint="사번은 변경할 수 없습니다 (불변)">
                <Input value={emp?.employeeNumber ?? ""} disabled />
              </FormField>
              <FormField label="부서" required>
                <Select options={departments.map((d) => ({ value: d.id, label: d.name }))} value={departmentCodeId} onChange={(e) => setDepartmentCodeId(e.target.value)} />
              </FormField>
              <FormField label="직급" required>
                <Select options={positions.map((p) => ({ value: p.id, label: p.name }))} value={positionCodeId} onChange={(e) => setPositionCodeId(e.target.value)} />
              </FormField>
              <FormField label="입사일" required error={errors.hireDate}>
                <DatePicker value={hireDate} onChange={setHireDate} invalid={!!errors.hireDate} />
              </FormField>
              <FormField label="연락처" error={errors.phone}>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" invalid={!!errors.phone} />
              </FormField>
            </div>
          )}
        </Card>
      </form>
    </AppShell>
  );
}
