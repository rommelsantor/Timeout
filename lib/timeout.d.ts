declare type Callback = (...params: any[]) => void;
export declare class Timeout {
    private static keyId;
    private static originalMs;
    private static metadata;
    /**
     * clear timeout with optionally erasing any info about it
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
    static set(key: string, callback: Callback, ms: number, ...params: any[]): boolean;
    /**
     * returns a function allowing you to test if it has executed
     * @param callback
     * @param ms
     * @param params
     */
    static set(callback: Callback, ms: number, ...params: any[]): boolean;
    static set(...args: any[]): boolean;
    /**
     * same as set() except returns false if timeout already exists
     * @param key
     * @param callback
     * @param ms
     * @param params
     */
    static create(key: string, callback: Callback, ms: number, ...params: any[]): boolean;
    /**
     * same as set() except returns false if timeout already exists
     * @param callback
     * @param ms
     * @param params
     */
    static create(callback: Callback, ms: number, ...params: any[]): boolean;
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
     * timeout has been created
     * @param key
     */
    static exists(key: string): boolean;
    /**
     * remaining time until timeout will occur
     * @param key
     */
    static remaining(key: string): number;
    /**
     * timeout does exist, but will not execute because it is paused
     * @param key
     */
    static paused(key: string): boolean;
    /**
     * instanciate timeout to handle as object
     * @param callback
     * @param ms
     * @param params
     */
    static instantiate(callback: Callback, ms?: number, ...params: any[]): {
        clear: (erase?: boolean) => void;
        executed: () => boolean;
        exists: () => boolean;
        pause: () => number | boolean;
        paused: () => boolean;
        pending: () => boolean;
        remaining: () => number;
        restart: () => boolean;
        resume: () => boolean;
        lastExecuted: () => Date;
        set: (newCallback: Callback, newMs?: number, ...newParams: any[]) => boolean;
    };
    /**
     * restart timeout with original time
     * @param key
     */
    static restart(key: string): boolean;
    /**
     * pause our execution countdown until we're ready for it to resume
     * @param key
     */
    static pause(key: string): boolean | number;
    /**
     * resume paused Timeout with the remaining time
     * @param key
     */
    static resume(key: string): boolean;
}
export {};
