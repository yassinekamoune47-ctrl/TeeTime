import {api} from "@/api/apiConfig.ts";
import type {ApiResponse} from "@/features/auth/types.ts";
import type {CreateManager, ManagerListProps} from "@/features/manager/types.ts";
import type {EUStatus, SearchUsers} from "@/api/types.ts";
import type {updateUserDataRequest, updateUserPasswordRequest, User} from "@/types/user.types.ts";

export const userApi = {
    getAllUsers: ({ page = 0, size = 10 }) =>
        api.post<ApiResponse<User[]>>('/users/all', { page, size }),

    searchUsers: (searchUser: SearchUsers) =>
        api.post<ApiResponse<User[]>>('/users/all', searchUser),

    getAllManagers: ({ page = 0, size = 10 }) =>
        api.post<ApiResponse<ManagerListProps[]>>('/users/managers', { page, size }),

    addManager: (data: CreateManager) =>
        api.post('/users/add-manager', data),

    changeUserStatus: ({ userId, status }: { userId: string; status: EUStatus }) =>
        api.patch('/users/change-status', { userId, status }),

    updateMyData: (data: updateUserDataRequest) =>
        api.patch('/users/updateMyData', data),

    updateMyPassword: (data: updateUserPasswordRequest) =>
        api.put('/users/updateMyPassword', data),

    updateMyProfilePicture: (file: File) => {
        const fd = new FormData();
        fd.append('profilePic', file);
        return api.put('/users/updateMyPP', fd);
    }
}