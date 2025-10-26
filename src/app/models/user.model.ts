export interface UserDataDto {
    id?: string;
    email: string;
    password: string;
    name: string;
}

export interface UserInfoForViewDto {
    name: string;
    email: string;
    id: string;
}

export interface UserDataForUpdateDto {
    id: string;
    email: string;
    newPassword?: string;
    oldPassword?: string;
    name: string;
}