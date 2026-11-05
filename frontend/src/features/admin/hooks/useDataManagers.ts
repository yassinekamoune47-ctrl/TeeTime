import {useInfiniteQuery} from "@tanstack/react-query";
import {userApi} from "@/api/endpoints/user.api.ts";

export function useDataManagers() {

    return useInfiniteQuery({
        queryKey: ['getAllManagers'],
        queryFn: async ({pageParam = 0}) => {
            const res = await userApi.getAllManagers({ page: pageParam, size: 10 });
            return res.data.data;   // unwrap Axios → API wrapper → array
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < 10 ? undefined : allPages.length,
        retry: false,
    });
}