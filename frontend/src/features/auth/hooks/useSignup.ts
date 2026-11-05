import {useAuthStore} from "@/features/auth/store.ts";
import {useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {authApi} from "@/api/endpoints/auth.api.ts";

export function useSignup(){
    const signUpStore = useAuthStore((state) => state.signup);
    const setMfaPending = useAuthStore((state) => state.setMfaPending);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.signup,
        onSuccess: (response) => {
            if (response.data.success) {
                signUpStore(response.data.data);
                navigate('/dashboard', {replace: true});
                setMfaPending(false);
            }
        },
    })
}