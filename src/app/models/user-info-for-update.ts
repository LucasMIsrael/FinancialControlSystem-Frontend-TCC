export interface UserDataForUpdateDto {
    id: string;
    email: string;
    newPassword?: string;
    oldPassword?: string;
    name: string;
}