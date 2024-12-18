import { Input, ModelSignal } from "@angular/core";

export interface TimeSheetDetail {
    timeSheetDetailId?:number;
    e_timeSheetId?:number;
    projectId?:number;
    projectName: string;
    projectTaskId?: number;
    projectTaskName: string;
    sundayHours: number;
    mondayHours: number;
    tuesdayHours: number;
    wednesdayHours: number;
    thursdayHours: number;
    fridayHours: number;
    saturdayHours: number;
    notes: string;
}
