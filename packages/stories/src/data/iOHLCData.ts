export interface IOHLCData {
    readonly close: number;
    readonly high: number;
    readonly low: number;
    readonly open: number;
    readonly date: Date;
    readonly volume: number;
}
