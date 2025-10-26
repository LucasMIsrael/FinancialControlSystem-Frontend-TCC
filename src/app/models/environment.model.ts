export enum EnvironmentTypeEnum {
    Personal = 1,
    Family = 2,
    Business = 3
}

export interface EnvironmentData {
    id?: string;
    name: string;
    description: string;
    type: EnvironmentTypeEnum;
}
