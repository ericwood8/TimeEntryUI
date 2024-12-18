export enum SY_RequestStatusType {
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Canceled = 4,
    Reimbursed = 5,
    Voided = 6
}

export enum ClearanceType {
    PublicTrust = 1,
    Secret = 2,
    TopSecret = 3
}

export enum OvertimeType {
    RegularOT = 1,
    CompTime = 2,
    GuaranteedOT = 3,
    VoluntaryOT = 4,
    CompulsoryOT = 5,
    DoubleTime = 6
}

export enum LeaveType {
    Maternity = 1,
    PaidTimeOff = 2,
    Sick = 3,
    Sabbatical = 4,
    TimeOffInLieu = 5,
    CompTimeOff = 6,
    Disability = 7,
    Pregnancy = 8,
    Holiday = 9,
    FloatingHoliday = 10,
    FamilyAndMedicalLeaveAct = 11,
    Military = 12,
    Bereavement = 13,
    Parental = 14,
    JuryDuty = 15,
    Unpaid = 16
}

export enum ExpenseType {
    Mileage = 1,
    PerDiemHotel = 2,
    PerDiemMeals = 3,
    Lodging = 4,
    CarRental = 5,
    Airfare = 6,
    Meal = 7,
    Parking = 8,
    Toll = 9,
    Other = 10
}
