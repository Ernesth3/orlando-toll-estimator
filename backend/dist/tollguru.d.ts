export interface TollCost {
    tag: number;
    cash: number;
}
export declare function getTollCost(opts: {
    from: string;
    to: string;
    waypoints?: string[];
    vehicleType?: string;
    departureTime?: string;
    currency?: string;
}): Promise<TollCost>;
//# sourceMappingURL=tollguru.d.ts.map