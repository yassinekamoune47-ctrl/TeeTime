import {api} from "@/api/apiConfig.ts";

export interface CourseUpdatePayload {
    id: string;
    name?: string;
    holeCount?: number;
    description?: string;
    price_per_player?: number | null;
    image?: string | null;
    is_active?: boolean;
    extra_fees?: Array<{
        label: string;
        labelEn?: string;
        price: number | null;
        priceMax?: number | null;
    }>;
}

export const courseApi = {
    addCourse: (formData: FormData) => {
        return api.post('courses/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    updateCourse: (data: FormData) => {
        return api.patch('courses/update', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    deleteCourse: (id: string) => {
        return api.delete(`courses/delete/${id}`);
    },
    updateCourseDetails: (data: CourseUpdatePayload) => api.patch('courses/update', data),
}