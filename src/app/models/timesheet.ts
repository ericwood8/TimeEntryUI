import { Employee } from "./employee";

export interface TimeSheet {
   timeSheetId?: number;
   whenEntered?: Date;
   employeeId?: number;
   employee?: Employee;
   notes?: string;
}