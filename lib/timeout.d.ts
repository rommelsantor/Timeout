declare type Callback = (...params: any[]) => void;
declare type Checker = () => boolean;
declare class MetadataRecord {
    callback: Callback;
    key: string;
    ms: number;
    params: any[];
    executedTime: number;
    paused: boolean;
    startTime: number;
    timeSpentWaiting: number;
    constructor(callback: Callback, key: string, ms: number, params: any[]);
}
export interface TimeoutInstance {
    call: () => any;
    clear: (erase?: boolean) => void;
    elapsed: () => number;
    executed: () => boolean;
    exists: () => boolean;
    lastExecuted: () => Date;
    meta: () => MetadataRecord;
    pause: () => number | boolean;
    paused: () => boolean;
    pending: () => boolean;
    remaining: () => number;
    reset: (ms: number, ...params: any[]) => boolean | Checker;
    restart: () => boolean | Checker;
    resume: () => boolean | Checker;
    set: (newCallback: Callback, newMs?: number, ...newParams: any[]) => Checker;
}
export declare class Timeout {
    private static keyId;
    private static keyCall;
    private static originalMs;
    private static metadata;
    /**
     * clear timeout and optionally erase all knowledge of its existence
     * @param key
     * @param erase
     */
    static clear(key: string, erase?: boolean): void;
    /**
     * returns a function allowing you to test if it has executed
     * @param key
     * @param callback
     * @param ms
     * @param params
     */
    static set(key: string, callback: Callback, ms: number, ...params: any[]): Checker;
    /**
     * returns a function allowing you to test if it has executed
     * @param callback
     * @param ms
     * @param params
     */
    static set(callback: Callback, ms: number, ...params: any[]): Checker;
    static set(...args: any[]): Checker;
    /**
     * same as set() except returns false if timeout already exists
     * @param key
     * @param callback
     * @param ms
     * @param params
     */
    static create(key: string, callback: Callback, ms: number, ...params: any[]): boolean | Checker;
    /**
     * same as set() except returns false if timeout already exists
     * @param callback
     * @param ms
     * @param params
     */
    static create(callback: Callback, ms: number, ...params: any[]): boolean | Checker;
    /**
     * elapsed time since the timeout was created
     * @param key
     */
    static elapsed(key: string): number;
    /**
     * timeout has been created
     * @param key
     */
    static exists(key: string): boolean;
    /**
     * fire the callback on demand, without affecting the timeout or meta data (execution time)
     * @param key
     * @returns {(false|any)} false if timeout does not exist or the return value of the callback
     */
    static call(key: string): any;
    /**
     * test if a timeout has run
     * @param key
     */
    static executed(key: string): boolean;
    /**
     * when timeout was last executed
     * @param key
     */
    static lastExecuted(key: string): Date;
    /**
     * metadata about a timeout
     * @param key
     */
    static meta(key: string): MetadataRecord;
    /**
     * timeout does exist, but has not yet run
     * @param key
     */
    static pending(key: string): boolean;
    /**
     * timeout does exist, but will not execute because it is paused
     * @param key
     */
    static paused(key: string): boolean;
    /**
     * remaining time until timeout will occur
     * @param key
     */
    static remaining(key: string): number;
    /**
     * set timeout anew, optionally with new time and params
     * @param key
     * @param ms new millisecs before execution
     * @param params new parameters to callback
     */
    static reset(key: string, ms: number, ...params: any[]): boolean | Checker;
    /**
     * restart timeout with original time
     * @param key
     * @param force restart even even if not yet executed
     */
    static restart(key: string, force?: boolean): boolean | Checker;
    /**
     * pause our execution countdown until we're ready for it to resume
     * @param key
     */
    static pause(key: string): boolean | number;
    /**
     * resume paused Timeout with the remaining time
     * @param key
     */
    static resume(key: string): boolean | Checker;
    /**
     * instantiate timeout to handle as object
     * @param key
     * @param callback
     * @param ms
     * @param params
     */
    static instantiate(key: string, callback: Callback, ms: number, ...params: any[]): TimeoutInstance;
    /**
     * instantiate timeout to handle as object
     * @param callback
     * @param ms
     * @param params
     */
    static instantiate(callback: Callback, ms: number, ...params: any[]): TimeoutInstance;
    static instantiate(...args: any[]): TimeoutInstance;
}
export {};
