import { Department, DepartmentTeam } from "./department";

export interface Employee {
    employeeId?: number; // Optional for new ones
    name: string;
    managerId?: number;
    departmentId: number;
    departmentTeamId: number;
    sY_IsoCountry_Alpha3Code: string;   // the country whose holidays apply: an ISO alpha-3 code
    availableLeaveHours: number;
    donatedHrsReceived: number;
    isActive: boolean;
    whenLeft?: string;
    manager?: Employee;
    department?: Department;
    departmentTeam?: DepartmentTeam;
}

/** What a drop-down or a name column needs of an employee: GET api/employees/lookup (E12). The full Employee carries manager, department and team too. */
export interface EmployeeLookup {
    employeeId: number;
    name: string;
}
