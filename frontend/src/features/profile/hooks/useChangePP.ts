import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi } from "@/api/endpoints/user.api.ts";
import { authApi } from "@/api/endpoints/auth.api.ts";
import { useAuthStore } from "@/features/auth/store.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

export function useChangePP() {
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationFn: userApi.updateMyProfilePicture,
        onSuccess: async () => {
            try {
                const res = await authApi.me();
                if (res.data.success) {
                    login(res.data.data);
                }
                toast.success('Profile picture updated successfully');
            } catch {
                toast.error('Failed to sync updated profile');
            }
        },
        onError: (err) => {
            toast.error(`Failed to change profile picture: ${getApiErrorMessage(err)}`);
        }
    });
}