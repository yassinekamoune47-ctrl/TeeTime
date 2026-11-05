import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {clubApi} from "@/api/endpoints/club.api.ts";
import {getApiErrorMessage} from "@/lib/apiError.ts";

export const useCreateClub = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clubApi.addClub,
        onSuccess: () => {
            //reset the store cache with the new data
            queryClient.invalidateQueries({ queryKey: ['searchClubs'] });
            toast.success('Club created');
        },
        onError: (err) => {
            toast.error(`Failed to create club: ${getApiErrorMessage(err)}`);
        }
    })
}