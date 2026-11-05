import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth.api';
import { useAuthStore } from '@/features/auth/store';

export function useAuth() {
    const loginStore = useAuthStore((state) => state.login);
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await authApi.me();
            if (response.data.success) {
                loginStore(response.data.data);
            }
            return response.data;
        },
        retry: false,
        enabled: !user, // Only run if no user in store
    });
}