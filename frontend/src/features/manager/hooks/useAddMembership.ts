import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipApi } from '@/api/endpoints/membership.api.ts';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';
import type { AddMembership } from '../../memberships/types.ts';

export function useAddMembership() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMembership) => membershipApi.addMembership(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            toast.success('Membership added successfully', { duration: 5000 });
        },
        onError: (err) => {
            toast.error(`Failed to add membership: ${getApiErrorMessage(err)}`);
        },
    });
}
