import {useMutation, useQueryClient} from "@tanstack/react-query";
import {courseApi} from "@/api/endpoints/course.api.ts";
import {toast} from "sonner";
import {getApiErrorMessage} from "@/lib/apiError.ts";

export function useCreateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: courseApi.addCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getMyClub'] });
            toast.success('Course created successfully', { duration: 5000 });
        },
        onError: (err) => {
            toast.error(`Failed to create course: ${getApiErrorMessage(err)}`);
        }
    })
}