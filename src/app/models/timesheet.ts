import { EmployeeLookup } from "./employee";

export interface TimeSheet {
   timeSheetId?: number;
   whenEntered?: Date;
   employeeId?: number;
   employee?: EmployeeLookup;
   notes?: string;
}