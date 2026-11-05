import {api} from "@/api/apiConfig.ts";
import type {ApiResponse} from "@/features/auth/types.ts";
import type {Club, ClubFormData, CreateClub} from "@/features/clubs/types.ts";
import type {ReassignClub, SearchClubs} from "@/api/types.ts";

export const clubApi = {
    searchClubs: ( searchClub: SearchClubs) =>
        api.post<ApiResponse<Club[]>>('/clubs/all', searchClub),

    getMyClub: () =>
        api.get<ApiResponse<Club>>('/clubs/my-club'),

    addClub: (data: CreateClub) =>
        api.post('/clubs/add', data),

    updateClub: (data: ClubFormData) => {
        const fd = new FormData();
        fd.append('id', data.id ?? '');
        fd.append('name', data.name ?? '');
        fd.append('city', data.city ?? '');
        fd.append('address', data.address ?? '');
        fd.append('phone', data.phone ?? '');
        fd.append('email', data.email ?? '');
        fd.append('description', data.description ?? '');
        if (data.logo instanceof File) fd.append('logoURL', data.logo);
        if (data.cover instanceof File) fd.append('coverURL', data.cover);
        return api.patch('/clubs/update', fd);
    },

    reassignClub: (data: ReassignClub) =>
        api.patch('/clubs/reassign', data),

    changeClubStatus: ({ clubId, status }: { clubId: string; status: string }) =>
        api.patch(`/clubs/change-status`, null, { params: { clubId, status } }),
}