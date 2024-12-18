import { Department, DepartmentTeam } from "./department";

export interface Employee {
    employeeId?: number; // Optional for new ones
    managerId?: number;
    departmentId: number;
    departmentTeamId: number;
    availableLeaveHours: number;
    donatedHrsReceived: number;
    name: string;
    isActive: boolean;
    manager?: Employee;
    department?: Department;
    departmentTeam?: DepartmentTeam;
}