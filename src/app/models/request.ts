import { Employee } from "./employee";

export interface Request {
    requestId?: number; // Optional for new ones
    employeeId: number;
    whenRequested?: Date;
    sY_RequestStatusTypeId?: number;
    clearanceTypeId?: number;
    overtimeTypeId?: number;
    leaveTypeId?: number;
    expenseTypeId?: number;
    reason?: string;
    leaveStart?: string;
    leaveEnd?: string;
    overtimeHrsRequested?: number;
    statusDate?: Date;

    employee?: Employee;
}