"use strict";

var ClearanceTypes = { PublicTrust: 1, Secret: 2, TopSecret: 3 };

var ExpenseTypes = {
    Airfare: 1,
    CarRental: 2,
    Lodging: 3,
    Meal: 4,
    Mileage: 5,
    Other: 6,
    Parking: 7,
    PerDiemHotel: 8,
    PerDiemMeals: 9,
    Toll: 10
};

var LeaveTypes = {
    Bereavement: 1,
    Compensatorytimeoff: 2,
    Disability: 3,
    FamilyandMedicalLeaveAct: 4,
    Floatingholiday: 5,
    Holiday: 6,
    JuryDuty: 7,
    Maternity: 8,
    Military: 9,
    Paidtimeoff: 10,
    Parental: 11,
    Pregnancy: 12,
    Sabbatical: 13,
    Sick: 14,
    Timeoffinlieu: 15,
    Unpaid: 16
};

var OvertimeTypes = {
    Comptime: 1,
    Compulsoryovertime: 2,
    Doubletime: 3,
    Guaranteedovertime: 4,
    Regularovertime: 5,
    Voluntaryovertime: 6
};

var SY_RequestStatusType = {
    Pending: 1,
    Approved: 2,
    Rejected: 3,
    Canceled: 4,
    Reimbursed: 5,
    Voided: 6
};

var SY_RequestType = {
    Clearance: 1,
    Leave: 2,
    Overtime: 3,
    Expense: 4
};

var SY_ResponseType = {
    Approved: 1,
    Rejected: 2,
    Reimbursed: 3,
    Voided: 4
};

var SY_Role = {
    Admin: 1,
    Tester: 2,
    SalesDemo: 3,
    Manager: 4,
    Employee: 5,
    HumanResources: 6
};

