import type {
    AddMembership,
    SearchAllMemberships,
    SearchMyMemberships,
    SearchPlayerClubs,
    UpdateMembership
} from "@/features/memberships/types.ts";
import {api} from "@/api/apiConfig.ts";

export const membershipApi = {
    getMembership: (id: string) =>
        api.get(`/memberships/${id}`),

    searchAllMemberships: (searchAllMemberships: SearchAllMemberships) =>
        api.post('/memberships/all', searchAllMemberships),

    searchMyMemberships: (searchMyMemberships: SearchMyMemberships) =>
        api.post('/memberships/getMyMemberships', searchMyMemberships),

    searchPlayerClubs: (searchPlayerClubs: SearchPlayerClubs) =>
        api.post('/memberships/player/clubs', searchPlayerClubs),

    addMembership: (data: AddMembership) =>
        api.post('/memberships/add', data),

    updateMembership: (date: UpdateMembership) =>
        api.patch('/memberships/update', date),
}