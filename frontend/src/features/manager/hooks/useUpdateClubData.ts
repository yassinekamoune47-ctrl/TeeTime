import {useMutation, useQueryClient} from "@tanstack/react-query";
import {clubApi} from "@/api/endpoints/club.api.ts";
import {toast} from "sonner";
import {getApiErrorMessage} from "@/lib/apiError.ts";

export const useUpdateClubData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clubApi.updateClub,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getMyClub'] });
            toast.success('Club status updated');
        },
        onError: (err) => {
            toast.error(`Failed to change the club data: ${getApiErrorMessage(err)}`);
        }
    })
}