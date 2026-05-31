"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeApi, codeApi } from "@/lib/api";
import type { CommonCode, EmployeeView, EmploymentStatus } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { InfiniteLoader } from "@/components/ui/infinite-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import styles from "./employees.module.css";

const PAGE_SIZE = 20;

export default function EmployeeListPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<CommonCode[]>([]);
  const [keyword, setKeyword] = useState("");
  const [departmentCodeId, setDepartmentCodeId] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");

  const [items, setItems] = useState<EmployeeView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    codeApi.list("department").then(setDepartments);
  }, []);

  // 페이지 단위 조회 — append=false면 목록 교체(첫 로드/필터 변경), true면 이어붙이기(무한 스크롤)
  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setReloading(true);
      try {
        const res = await employeeApi.list({
          keyword,
          departmentCodeId: departmentCodeId || undefined,
          employmentStatus: (employmentStatus || undefined) as EmploymentStatus | undefined,
          page: targetPage,
          pageSize: PAGE_SIZE,
        });
        setTotal(res.total);
        setPage(targetPage);
        setItems((prev) => (append ? [...prev, ...res.items] : res.items));
      } finally {
        if (append) setLoadingMore(false);
        else setReloading(false);
        setFirstLoad(false);
      }
    },
    [keyword, departmentCodeId, employmentStatus]
  );

  // 필터/검색어 변경 시 디바운스 후 첫 페이지부터 다시 로드
  useEffect(() => {
    const t = setTimeout(() => fetchPage(1, false), 150);
    return () => clearTimeout(t);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (reloading || loadingMore) return;
    fetchPage(page + 1, true);
  }, [reloading, loadingMore, page, fetchPage]);

  const hasMore = items.length < total;

  const resetFilters = () => {
    setKeyword("");
    setDepartmentCodeId("");
    setEmploymentStatus("");
  };

  const hasFilter = !!(keyword || departmentCodeId || employmentStatus);

  return (
    <AppShell title="직원 관리">
      <div className={styles.page}>
        <PageHeader
          title="직원 관리"
          description="전체 직원을 조회하고 관리합니다"
          action={
            <Button onClick={() => router.push("/employees/new")}>
              <Icon name="plus" size={16} />
              직원 등록
            </Button>
          }
        />

        <div className={styles.toolbar}>
          <SearchInput
            placeholder="이름 · 사번 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            containerClassName={styles.search}
          />
          <Select
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            placeholder="부서 전체"
            value={departmentCodeId}
            onChange={(e) => setDepartmentCodeId(e.target.value)}
            className={styles.selDept}
          />
          <Select
            options={[
              { value: "active", label: "재직" },
              { value: "resigned", label: "퇴사" },
            ]}
            placeholder="재직상태"
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            className={styles.selStatus}
          />
        </div>

        {firstLoad ? (
          <Table>
            <THead>
              <TR>
                <TH>사번</TH><TH>이름</TH><TH>부서</TH><TH>직급</TH><TH>재직상태</TH><TH align="right">관리</TH>
              </TR>
            </THead>
            <TBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TR key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TD key={j}><Skeleton className={styles.skCell} /></TD>
                  ))}
                </TR>
              ))}
            </TBody>
          </Table>
        ) : items.length === 0 ? (
          <div className={styles.emptyWrap}>
            <EmptyState
              title="검색 결과가 없습니다"
              description="다른 검색어나 필터 조건으로 다시 시도해 보세요."
              action={hasFilter ? <Button variant="secondary" onClick={resetFilters}>필터 초기화</Button> : undefined}
            />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>사번</TH><TH>이름</TH><TH>부서</TH><TH>직급</TH><TH>재직상태</TH><TH align="right">관리</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((e) => (
                  <TR key={e.id} className={styles.row}>
                    <TD className={styles.empNo}>{e.employeeNumber}</TD>
                    <TD>
                      <div className={styles.nameCell}>
                        <Avatar name={e.name} size={32} />
                        {e.name}
                      </div>
                    </TD>
                    <TD>{e.departmentName}</TD>
                    <TD>{e.positionName}</TD>
                    <TD>
                      <Badge variant={e.employmentStatus === "active" ? "active" : "resigned"}>
                        {e.employmentStatus === "active" ? "재직" : "퇴사"}
                      </Badge>
                    </TD>
                    <TD align="right">
                      <DropdownMenu
                        actions={[
                          { label: "상세 보기", icon: "eye", onClick: () => router.push(`/employees/${e.id}`) },
                          { label: "수정", icon: "edit", onClick: () => router.push(`/employees/${e.id}/edit`) },
                          { label: "계정·퇴사 관리", icon: "shield", onClick: () => router.push(`/employees/${e.id}?tab=account`) },
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
    </AppShell>
  );
}
