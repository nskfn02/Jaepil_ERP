"use client";

import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import { Spinner } from "./spinner";
import styles from "./infinite-loader.module.css";

/**
 * 목록 하단에 두는 무한 스크롤 트리거.
 * - hasMore && 화면 진입 → onLoadMore 호출
 * - loading 중에는 스피너 표시
 * - 더 없으면 "모두 불러왔습니다" 표시 (total>0일 때만)
 */
export function InfiniteLoader({
  onLoadMore,
  hasMore,
  loading,
  endLabel = "모두 불러왔습니다",
  showEnd = true,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  endLabel?: string;
  showEnd?: boolean;
}) {
  const ref = useInfiniteScroll<HTMLDivElement>(onLoadMore, { hasMore, loading });

  if (!hasMore) {
    return showEnd ? <div className={styles.end}>{endLabel}</div> : null;
  }

  return (
    <div ref={ref} className={styles.sentinel}>
      {loading && <Spinner size={20} />}
    </div>
  );
}
