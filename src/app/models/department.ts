export interface Department {
    departmentId?: number; // Optional for new ones
    name: string;
    isDefault: boolean;
    isActive: boolean;
    teams: DepartmentTeam[]
}

export interface DepartmentTeam {
    departmentTeamId?: number; // Optional for new ones
    departmentId: number;
    name: string;
    isDefault: boolean;
    isActive: boolean;
}