"use client";

import { useEffect, useRef } from "react";

/**
 * 무한 스크롤 트리거 훅.
 * 반환한 ref를 목록 하단 sentinel 요소에 연결하면, 화면에 들어올 때 onLoadMore를 호출한다.
 * hasMore=false이거나 loading 중이면 호출하지 않는다.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onLoadMore: () => void,
  options: { hasMore: boolean; loading: boolean; rootMargin?: string }
) {
  const { hasMore, loading, rootMargin = "200px" } = options;
  const ref = useRef<T | null>(null);
  // 최신 콜백/상태를 옵저버 재생성 없이 참조하기 위한 ref
  const cb = useRef(onLoadMore);
  cb.current = onLoadMore;
  const state = useRef({ hasMore, loading });
  state.current = { hasMore, loading };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && state.current.hasMore && !state.current.loading) {
          cb.current();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}
