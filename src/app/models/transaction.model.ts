export interface TransactionDataDto {
    id?: string;
    type: TransactionTypeEnum;
    recurrenceType: TransactionRecurrenceTypeEnum;
    description: string;
    amount: number;
    transactionDate: string;
}

export interface TransactionDataForViewDto extends TransactionDataDto {
    id: string;
    transactionNumber?: number;
}

export enum TransactionTypeEnum {
    Income = 1,    // Receita
    Expense = 2    // Despesa
}

export enum TransactionRecurrenceTypeEnum {
    None = 0,      // Não recorrente
    Daily = 1,     // Diária
    Weekly = 2,    // Semanal
    Monthly = 3,   // Mensal
    Semestral = 4, // Semestral
    Annual = 5     // Anual
}