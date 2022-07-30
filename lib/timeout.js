"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var MetadataRecord = /** @class */ (function () {
    function MetadataRecord(callback, key, ms, params) {
        this.callback = callback;
        this.key = key;
        this.ms = ms;
        this.params = params;
        this.paused = false;
        this.startTime = new Date().getTime();
        this.timeSpentWaiting = 0;
    }
    return MetadataRecord;
}());
var Timeout = /** @class */ (function () {
    function Timeout() {
    }
    /**
     * clear timeout and optionally erase all knowledge of its existence
     * @param key
     * @param erase
     */
    Timeout.clear = function (key, erase) {
        if (erase === void 0) { erase = true; }
        clearTimeout(Timeout.keyId[key]);
        delete Timeout.keyId[key];
        delete Timeout.keyCall[key];
        if (erase) {
            delete Timeout.metadata[key];
            delete Timeout.originalMs[key];
        }
    };
    Timeout.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var key;
        var ms;
        var params;
        var callback;
        if (args.length === 0) {
            throw Error('Timeout.set() requires at least one argument');
        }
        if (typeof args[1] === 'function') {
            key = args[0], callback = args[1], ms = args[2], params = args.slice(3);
        }
        else {
            callback = args[0], ms = args[1], params = args.slice(2);
            key = callback.toString();
        }
        if (!callback) {
            throw Error('Timeout.set() requires a callback parameter');
        }
        Timeout.clear(key);
        var invoke = function () {
            Timeout.metadata[key].executedTime = new Date().getTime();
            callback.apply(void 0, params);
        };
        Timeout.keyId[key] = setTimeout(invoke, ms || 0);
        Timeout.keyCall[key] = function () { return callback.apply(void 0, params); };
        Timeout.originalMs[key] = Timeout.originalMs[key] || ms;
        Timeout.metadata[key] = new MetadataRecord(callback, key, ms, params);
        return function () { return Timeout.executed(key); };
    };
    Timeout.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            throw Error('Timeout.create() requires at least one argument');
        }
        var key;
        if (typeof args[1] === 'function') {
            key = args[0];
        }
        else {
            var callback = args[0];
            key = callback.toString();
        }
        return Timeout.exists(key) ? false : Timeout.set.apply(Timeout, args);
    };
    /**
     * elapsed time since the timeout was created
     * @param key
     */
    Timeout.elapsed = function (key) {
        var metaDataRecord = Timeout.metadata[key];
        if (!metaDataRecord)
            return 0;
        return Math.max(0, new Date().getTime() - metaDataRecord.startTime);
    };
    /**
     * timeout has been created
     * @param key
     */
    Timeout.exists = function (key) {
        return key in Timeout.keyId || (Timeout.metadata)[key] !== undefined;
    };
    /**
     * fire the callback on demand, without affecting the timeout or meta data (execution time)
     * @param key
     * @returns {(false|any)} false if timeout does not exist or the return value of the callback
     */
    Timeout.call = function (key) {
        return Timeout.exists(key) && (Timeout.keyCall)[key]();
    };
    /**
     * test if a timeout has run
     * @param key
     */
    Timeout.executed = function (key) {
        return Timeout.exists(key) && !!Timeout.metadata[key].executedTime;
    };
    /**
     * when timeout was last executed
     * @param key
     */
    Timeout.lastExecuted = function (key) {
        return !Timeout.executed(key)
            ? null
            : new Date(Timeout.metadata[key].executedTime);
    };
    /**
     * metadata about a timeout
     * @param key
     */
    Timeout.meta = function (key) {
        return Timeout.metadata[key];
    };
    /**
     * timeout does exist, but has not yet run
     * @param key
     */
    Timeout.pending = function (key) {
        return Timeout.exists(key) && !Timeout.executed(key);
    };
    /**
     * timeout does exist, but will not execute because it is paused
     * @param key
     */
    Timeout.paused = function (key) {
        return Timeout.exists(key)
            && !Timeout.executed(key)
            && Timeout.metadata[key].paused;
    };
    /**
     * remaining time until timeout will occur
     * @param key
     */
    Timeout.remaining = function (key) {
        if (!Timeout.metadata[key])
            return 0;
        var metaDataRecord = Timeout.metadata[key];
        return Timeout.paused(key)
            ? metaDataRecord.ms - metaDataRecord.timeSpentWaiting
            : Math.max(0, metaDataRecord.startTime + metaDataRecord.ms - new Date().getTime());
    };
    /**
     * set timeout anew, optionally with new time and params
     * @param key
     * @param ms new millisecs before execution
     * @param params new parameters to callback
     */
    Timeout.reset = function (key, ms) {
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        var metaDataRecord = Timeout.metadata[key];
        if (!metaDataRecord)
            return false;
        Timeout.clear(key, false);
        if (metaDataRecord.paused) {
            metaDataRecord.paused = false;
        }
        return Timeout.set.apply(Timeout, __spreadArrays([key,
            metaDataRecord.callback, ms !== null && ms !== void 0 ? ms : Timeout.originalMs[key]], (params || metaDataRecord.params)));
    };
    /**
     * restart timeout with original time
     * @param key
     * @param force restart even even if not yet executed
     */
    Timeout.restart = function (key, force) {
        if (force === void 0) { force = false; }
        if (!Timeout.metadata[key] || (!force && Timeout.executed(key)))
            return false;
        var metaDataRecord = Timeout.metadata[key];
        Timeout.clear(key, false);
        if (metaDataRecord.paused) {
            metaDataRecord.paused = false;
        }
        return Timeout.set.apply(Timeout, __spreadArrays([key, metaDataRecord.callback, Timeout.originalMs[key]], metaDataRecord.params));
    };
    /**
     * pause our execution countdown until we're ready for it to resume
     * @param key
     */
    Timeout.pause = function (key) {
        if (!Timeout.metadata[key] || Timeout.paused(key) || Timeout.executed(key))
            return false;
        Timeout.clear(key, false);
        var metaDataRecord = Timeout.metadata[key];
        metaDataRecord.paused = true;
        metaDataRecord.timeSpentWaiting = new Date().getTime() - metaDataRecord.startTime;
        return metaDataRecord.timeSpentWaiting;
    };
    /**
     * resume paused Timeout with the remaining time
     * @param key
     */
    Timeout.resume = function (key) {
        if (!Timeout.metadata[key] || Timeout.executed(key))
            return false;
        var metaDataRecord = Timeout.metadata[key];
        if (!metaDataRecord.paused)
            return false;
        var originalMs = Timeout.originalMs[key];
        var remainingTime = metaDataRecord.ms - metaDataRecord.timeSpentWaiting;
        var result = Timeout.set.apply(Timeout, __spreadArrays([key, metaDataRecord.callback, remainingTime], metaDataRecord.params));
        Timeout.originalMs[key] = originalMs;
        return result;
    };
    Timeout.instantiate = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var key;
        var ms;
        var params;
        var callback;
        if (args.length === 0) {
            throw Error('Timeout.set() requires at least one argument');
        }
        var linkToExisting = args.length === 1 && typeof args[0] !== 'function';
        // hooking up to an existing timeout
        if (linkToExisting) {
            key = args[0];
            var metadata = Timeout.meta(key);
            if (!metadata) {
                throw Error('Timeout.instantiate() attempted to link to nonexistent object by key');
            }
            ms = metadata.ms;
            params = metadata.params;
            callback = metadata.callback;
        }
        else if (typeof args[1] === 'function') {
            key = args[0], callback = args[1], ms = args[2], params = args.slice(3);
        }
        else {
            callback = args[0], ms = args[1], params = args.slice(2);
            key = ("" + Math.random() + callback).replace(/\s/g, '');
        }
        if (!callback) {
            throw Error('Timeout.instantiate() requires a function parameter');
        }
        if (!linkToExisting) {
            Timeout.set.apply(Timeout, __spreadArrays([key, callback, ms], params));
        }
        return {
            call: function () { return Timeout.call(key); },
            clear: function (erase) {
                if (erase === void 0) { erase = true; }
                return Timeout.clear(key, erase);
            },
            elapsed: function () { return Timeout.elapsed(key); },
            executed: function () { return Timeout.executed(key); },
            exists: function () { return Timeout.exists(key); },
            lastExecuted: function () { return Timeout.lastExecuted(key); },
            meta: function () { return Timeout.meta(key); },
            pause: function () { return Timeout.pause(key); },
            paused: function () { return Timeout.paused(key); },
            pending: function () { return Timeout.pending(key); },
            remaining: function () { return Timeout.remaining(key); },
            reset: function (ms) {
                var params = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    params[_i - 1] = arguments[_i];
                }
                return Timeout.reset.apply(Timeout, __spreadArrays([key, ms], params));
            },
            restart: function () { return Timeout.restart(key); },
            resume: function () { return Timeout.resume(key); },
            set: function (newCallback, newMs) {
                if (newMs === void 0) { newMs = 0; }
                var newParams = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    newParams[_i - 2] = arguments[_i];
                }
                return Timeout.set.apply(Timeout, __spreadArrays([key, newCallback, newMs], newParams));
            },
        };
    };
    Timeout.keyId = {};
    Timeout.keyCall = {};
    Timeout.originalMs = {};
    Timeout.metadata = {};
    return Timeout;
}());
exports.Timeout = Timeout;
//# sourceMappingURL=timeout.js.map