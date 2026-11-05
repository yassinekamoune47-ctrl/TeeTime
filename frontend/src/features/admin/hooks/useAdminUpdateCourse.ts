import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi, type CourseUpdatePayload } from '@/api/endpoints/course.api.ts';
import { getApiErrorMessage } from '@/lib/apiError.ts';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useAdminUpdateCourse() {
    const queryClient = useQueryClient();
    const { t } = useTranslation('app');

    return useMutation({
        mutationFn: (data: CourseUpdatePayload) => courseApi.updateCourseDetails(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['searchClubs'] });
            queryClient.invalidateQueries({ queryKey: ['memberships', 'clubs'] });
            toast.success(t('clubsManagement.courses.saved'));
        },
        onError: (err) => {
            toast.error(getApiErrorMessage(err));
        },
    });
}
