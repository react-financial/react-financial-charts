export interface IOHLCData {
    readonly close: number;
    readonly high: number;
    readonly low: number;
    readonly open: number;
    readonly time: Date;
}
