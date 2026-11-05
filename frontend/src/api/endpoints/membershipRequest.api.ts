import type { SearchMembershipRequests, SubscribeMembershipPayload } from '@/features/memberships/types';
import { api } from '@/api/apiConfig';

export const membershipRequestApi = {
  searchAll: (data: SearchMembershipRequests) =>
    api.post('/memberships-requests/all', data),

  // Members of the manager's club = players whose membership request was ACCEPTED
  searchMembers: (data: SearchMembershipRequests) =>
    api.post('/memberships-requests/members', data),

  request: (payload: SubscribeMembershipPayload) =>
    api.post('/memberships-requests/request', payload),

  accept: (requestId: string) =>
    api.post(`/memberships-requests/accept?requestId=${requestId}`),

  reject: (requestId: string) =>
    api.post(`/memberships-requests/reject?requestId=${requestId}`),
};
