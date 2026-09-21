import { Department, DepartmentTeam } from "./department";

export interface Employee {
    employeeId?: number; // Optional for new ones
    name: string;
    managerId?: number;
    departmentId: number;
    departmentTeamId: number;
    availableLeaveHours: number;
    donatedHrsReceived: number;
    isActive: boolean;
    whenLeft?: string;
    manager?: Employee;
    department?: Department;
    departmentTeam?: DepartmentTeam;
}
