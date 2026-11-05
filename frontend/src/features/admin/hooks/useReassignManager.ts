import {useMutation, useQueryClient} from "@tanstack/react-query";
import {clubApi} from "@/api/endpoints/club.api.ts";
import {toast} from "sonner";
import {getApiErrorMessage} from "@/lib/apiError.ts";

export const useReassignManager = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clubApi.reassignClub,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['searchClubs'] });
            toast.success('Manager reassigned successfully');
        },
        onError: (err) => {
            toast.error(`Failed to reassign manager: ${getApiErrorMessage(err)}`);
        }
    })
}