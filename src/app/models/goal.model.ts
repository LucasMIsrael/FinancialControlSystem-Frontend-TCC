export interface GoalDataDto {
    id?: string;
    description: string;
    value: number;
    periodType?: GoalPeriodTypeEnum | null;
    startDate?: string | null;
    singleDate?: string | null;
}

export interface GoalDataForViewDto {
    id?: string;
    goalNumber: number;
    description: string;
    value: number;
    status?: boolean | null;
    periodType?: GoalPeriodTypeEnum | null;
    startDate?: string | null;
    singleDate?: string | null;
}

export enum GoalPeriodTypeEnum {
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
    Semestral = 4,
    Annual = 5
}
