import { Employee } from "./employee";

export interface E_Request {
    requestId?: number; // Optional for new ones
    employeeId?: number;
    whenRequested?: Date;
    sY_RequestStatusTypeId: number;
    clearanceTypeId: number;
    overtimeTypeId: number;
    leaveTypeId: number;
    expenseTypeId: number;
    reason: string;
    leaveStart?: Date; 
    leaveEnd?: Date;
    overtimeHrsRequested: number;
    employee?: Employee;
}