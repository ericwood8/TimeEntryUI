export interface AuthUser {
    timeEntryUserId: number;
    name: string;
    sY_RoleId: number;
    sY_Role: string;
    employeeId?: number;
}

export interface LoginResponse {
    token: string;
    expiresUtc: string;
    user: AuthUser;
}
