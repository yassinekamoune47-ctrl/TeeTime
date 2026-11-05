import {useInfiniteQuery} from "@tanstack/react-query";
import {clubApi} from "@/api/endpoints/club.api.ts";
import type {SearchClubs} from "@/api/types.ts";

export function useSearchDataClubs(searchClub: Omit<SearchClubs, 'page' | 'size'>) {

    return useInfiniteQuery({
    queryKey: ['searchClubs', searchClub],   // include filters in key!
    queryFn: async ({ pageParam = 0 }) => {
        const res = await clubApi.searchClubs({
            ...searchClub,
            page: pageParam,
            size: 10,
        });
        return res.data.data;   // unwrap Axios → API wrapper → array
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
        lastPage.length < 10 ? undefined : allPages.length,
        retry: false,
    });
}