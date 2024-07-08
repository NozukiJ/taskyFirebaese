// src/app/core/models/intervalSet.model.ts


export interface IntervalSet {
    id: string;
    name: string;
    intervals: number[];
    selected?: boolean;
}