import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {userApi} from "@/api/endpoints/user.api.ts";
import {getApiErrorMessage} from "@/lib/apiError.ts";

export function useChangePassword() {
    return useMutation({
        mutationFn: userApi.updateMyPassword,
        onSuccess: () => {
            toast.success('Password changed successfully');
        },
        onError: (err) => {
            toast.error(`Failed to change the password: ${getApiErrorMessage(err)}`);
        }
    })
}