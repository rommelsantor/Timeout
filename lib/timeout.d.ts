declare type Callback = (...params: any[]) => void;
declare type Checker = () => boolean;
export interface TimeoutInstance {
    call: () => any;
    clear: (erase?: boolean) => void;
    executed: () => boolean;
    exists: () => boolean;
    lastExecuted: () => Date;
    pause: () => number | boolean;
    paused: () => boolean;
    pending: () => boolean;
    remaining: () => number;
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
     * restart timeout with original time
     * @param key
     */
    static restart(key: string): boolean | Checker;
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
     * @param callback
     * @param ms
     * @param params
     */
    static instantiate(callback: Callback, ms?: number, ...params: any[]): TimeoutInstance;
}
export {};
