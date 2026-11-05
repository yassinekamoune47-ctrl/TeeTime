import { useEffect, useRef } from "react";

export function useInfiniteScroll(
    onLoadMore: () => void,
    hasMore: boolean | undefined,
) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || !hasMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) onLoadMore();
        }, { rootMargin: "200px" }); // preload before reaching bottom

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, onLoadMore]);

    return ref;
}