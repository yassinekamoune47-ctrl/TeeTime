import {useMutation, useQueryClient} from "@tanstack/react-query";
import {clubApi} from "@/api/endpoints/club.api.ts";
import {toast} from "sonner";
import {getApiErrorMessage} from "@/lib/apiError.ts";

export const useChangeClubStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clubApi.changeClubStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['searchClubs'] });
            toast.success('Club status updated');
        },
        onError: (err) => {
            toast.error(`Failed to update club status: ${getApiErrorMessage(err)}`);
        }
    })
}