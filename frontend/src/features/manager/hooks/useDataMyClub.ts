import { useQuery } from "@tanstack/react-query";
import {clubApi} from "@/api/endpoints/club.api.ts";
import type {Club} from "@/features/clubs/types.ts";

export function useDataMyClub() {
    return useQuery<Club>({
        queryKey: ['getMyClub'],
        queryFn: async () => {
            const res = await clubApi.getMyClub();
            return res.data.data;   // unwrap Axios → ApiResponse → Club
        },
        retry: false,
    });
}