"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetadataRecord {
    constructor(callback, key, ms, params) {
        this.callback = callback;
        this.key = key;
        this.ms = ms;
        this.params = params;
        this.paused = false;
        this.startTime = new Date().getTime();
        this.timeSpentWaiting = 0;
    }
}
class Timeout {
    /**
     * clear timeout and optionally erase all knowledge of its existence
     * @param key
     * @param erase
     */
    static clear(key, erase = true) {
        clearTimeout(Timeout.keyId[key]);
        delete Timeout.keyId[key];
        if (erase) {
            delete Timeout.metadata[key];
            delete Timeout.originalMs[key];
        }
    }
    static set(...args) {
        let key;
        let ms;
        let params;
        let callback;
        if (args.length === 0) {
            throw Error('Timeout.set() requires at least one argument');
        }
        if (typeof args[1] === 'function') {
            [key, callback, ms, ...params] = args;
        }
        else {
            [callback, ms, ...params] = args;
            key = callback.toString();
        }
        if (!callback) {
            throw Error('Timeout.set() requires a callback parameter');
        }
        Timeout.clear(key);
        const invoke = () => {
            Timeout.metadata[key].executedTime = new Date().getTime();
            callback(...params);
        };
        Timeout.keyId[key] = setTimeout(invoke, ms || 0);
        Timeout.originalMs[key] = Timeout.originalMs[key] || ms;
        Timeout.metadata[key] = new MetadataRecord(callback, key, ms, params);
        return () => Timeout.executed(key);
    }
    static create(...args) {
        if (args.length === 0) {
            throw Error('Timeout.create() requires at least one argument');
        }
        let key;
        if (typeof args[1] === 'function') {
            [key] = args;
        }
        else {
            const [callback] = args;
            key = callback.toString();
        }
        return Timeout.exists(key) ? false : Timeout.set(...args);
    }
    /**
     * timeout has been created
     * @param key
     */
    static exists(key) {
        return key in Timeout.keyId || (Timeout.metadata)[key] !== undefined;
    }
    /**
     * test if a timeout has run
     * @param key
     */
    static executed(key) {
        return Timeout.exists(key) && !!Timeout.metadata[key].executedTime;
    }
    /**
     * when timeout was last executed
     * @param key
     */
    static lastExecuted(key) {
        return !Timeout.executed(key)
            ? null
            : new Date(Timeout.metadata[key].executedTime);
    }
    /**
     * timeout does exist, but has not yet run
     * @param key
     */
    static pending(key) {
        return Timeout.exists(key) && !Timeout.executed(key);
    }
    /**
     * timeout does exist, but will not execute because it is paused
     * @param key
     */
    static paused(key) {
        return Timeout.exists(key)
            && !Timeout.executed(key)
            && Timeout.metadata[key].paused;
    }
    /**
     * remaining time until timeout will occur
     * @param key
     */
    static remaining(key) {
        if (!Timeout.metadata[key])
            return 0;
        const metaDataRecord = Timeout.metadata[key];
        return Timeout.paused(key)
            ? metaDataRecord.ms - metaDataRecord.timeSpentWaiting
            : Math.max(0, metaDataRecord.startTime + metaDataRecord.ms - new Date().getTime());
    }
    /**
     * restart timeout with original time
     * @param key
     */
    static restart(key) {
        if (!Timeout.metadata[key] || Timeout.executed(key))
            return false;
        const metaDataRecord = Timeout.metadata[key];
        Timeout.clear(key, false);
        if (metaDataRecord.paused) {
            metaDataRecord.paused = false;
        }
        return Timeout.set(key, metaDataRecord.callback, Timeout.originalMs[key], ...metaDataRecord.params);
    }
    /**
     * pause our execution countdown until we're ready for it to resume
     * @param key
     */
    static pause(key) {
        if (!Timeout.metadata[key] || Timeout.paused(key) || Timeout.executed(key))
            return false;
        Timeout.clear(key, false);
        const metaDataRecord = Timeout.metadata[key];
        metaDataRecord.paused = true;
        metaDataRecord.timeSpentWaiting = new Date().getTime() - metaDataRecord.startTime;
        return metaDataRecord.timeSpentWaiting;
    }
    /**
     * resume paused Timeout with the remaining time
     * @param key
     */
    static resume(key) {
        if (!Timeout.metadata[key] || Timeout.executed(key))
            return false;
        const metaDataRecord = Timeout.metadata[key];
        if (!metaDataRecord.paused)
            return false;
        const originalMs = Timeout.originalMs[key];
        const remainingTime = metaDataRecord.ms - metaDataRecord.timeSpentWaiting;
        const result = Timeout.set(key, metaDataRecord.callback, remainingTime, ...metaDataRecord.params);
        Timeout.originalMs[key] = originalMs;
        return result;
    }
    /**
     * instantiate timeout to handle as object
     * @param callback
     * @param ms
     * @param params
     */
    static instantiate(callback, ms = 0, ...params) {
        if (!callback) {
            throw Error('Timeout.instantiate() requires a function parameter');
        }
        const key = `${Math.random()}${callback}`.replace(/\s/g, '');
        Timeout.set(key, callback, ms, ...params);
        return {
            clear: (erase = true) => Timeout.clear(key, erase),
            executed: () => Timeout.executed(key),
            exists: () => Timeout.exists(key),
            lastExecuted: () => Timeout.lastExecuted(key),
            pause: () => Timeout.pause(key),
            paused: () => Timeout.paused(key),
            pending: () => Timeout.pending(key),
            remaining: () => Timeout.remaining(key),
            restart: () => Timeout.restart(key),
            resume: () => Timeout.resume(key),
            set: (newCallback, newMs = 0, ...newParams) => Timeout.set(key, newCallback, newMs, ...newParams),
        };
    }
}
exports.Timeout = Timeout;
Timeout.keyId = {};
Timeout.originalMs = {};
Timeout.metadata = {};
//# sourceMappingURL=timeout.js.map
