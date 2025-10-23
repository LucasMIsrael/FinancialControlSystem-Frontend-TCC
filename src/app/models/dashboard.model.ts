export interface FinancialSummaryDto {
    currentBalance: number;
    totalProfit: number;
    totalExpense: number;
    profitMargin: string;
    level: FinancialControlLevelEnum;
}

export interface BalanceOverTimeDto {
    date: string;
    balance: number;
}

export interface FilterForBalanceOverTimeDto {
    startDate: string;
    endDate: string;
}

export interface GoalsSummaryDto {
    completed: number;
    pending: number;
}

export interface UnexpectedExpensesAnalysisDto {
    totalUnexpectedExpenses: number;
    totalProfits: number;
    percentage: string;
    alertLevel: string;
}

export interface TopRecurringGoalsAchievedDto {
    achievementsCount: number;
    goalNumber: number;
    description: string;
    value: number;
}

export interface AchievementsDistributionDto {
    periodType: string;
    totalAchievements: number;
}

export interface FiltersForBalanceProjectionDto {
    periodValue: number;
    isYear: boolean;
}

export interface ProjectedBalanceDto {
    periodLabel: string;
    projectedBalance: number;
}

export enum FinancialControlLevelEnum {
    None = 0,
    Beginner = 1,                  // até 3 metas
    Learning = 2,                  // até 8 metas
    Intermediate = 3,              // até 15 metas
    Advanced = 4,                  // até 25 metas
    Expert = 5,                    // até 40 metas
    Master = 6,                    // até 60 metas
    FinancialController = 7        // acima de 60 metas
}