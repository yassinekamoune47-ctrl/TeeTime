import {useInfiniteQuery} from "@tanstack/react-query";
import {userApi} from "@/api/endpoints/user.api.ts";
import type {SearchUsers} from "@/api/types.ts";

export function useSearchDataUsers(searchUser: Omit<SearchUsers, 'page' | 'size'>) {

    return useInfiniteQuery({
        queryKey: ['searchUsers', searchUser],   // include filters in key!
        queryFn: async ({ pageParam = 0 }) => {
            const res = await userApi.searchUsers({
                ...searchUser,
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