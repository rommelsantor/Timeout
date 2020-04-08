"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var Timeout = function () {
  var keyId = {};
  var originalMs = {};
  var metadata = {};

  var _clear = function clear(key) {
    var erase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    clearTimeout(keyId[key]);
    delete keyId[key];

    if (erase) {
      delete metadata[key];
      delete originalMs[key];
    }
  }; // set(key, func, ms = 0, [param1, param2, ...]) -- user-defined key
  // set(func, ms = 0, [param1, param2, ...]) -- func used as key
  //
  // returns a function allowing you to test if it has executed


  var _set = function set() {
    var key, func, ms, params;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 0) {
      throw Error('Timeout.set() requires at least one argument');
    }

    if (typeof args[1] === 'function') {
      key = args[0];
      func = args[1];
      ms = args[2];
      params = args.slice(3);
    } else {
      func = args[0];
      ms = args[1];
      params = args.slice(2);
      key = func.toString();
    }

    if (!func) {
      throw Error('Timeout.set() requires a function parameter');
    }

    _clear(key);

    var invoke = function invoke() {
      return metadata[key] = false, func.apply(void 0, _toConsumableArray(params));
    };

    keyId[key] = setTimeout(invoke, ms || 0);
    originalMs[key] = originalMs[key] || ms;
    metadata[key] = {
      func: func,
      key: key,
      ms: ms,
      params: params,
      paused: false,
      startTime: new Date().getTime(),
      timeSpentWaiting: 0
    };
    return function () {
      return _executed(key);
    };
  }; // timeout has been created


  var _exists = function exists(key) {
    return key in keyId || metadata[key] !== undefined;
  }; // same as set() except returns false if timeout already exists


  var create = function create() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args.length === 0) {
      throw Error('Timeout.create() requires at least one argument');
    }

    var key;

    if (typeof args[1] === 'function') {
      key = args[0];
    } else {
      var func = args[0];
      key = func.toString();
    }

    return _exists(key) ? false : _set.apply(void 0, args);
  }; // test if a timeout has run


  var _executed = function executed(key) {
    return metadata[key] === false;
  }; // timeout does exist, but has not yet run


  var _pending = function pending(key) {
    return _exists(key) && !_executed(key);
  }; // timeout does exist, but will not execute because it is paused


  var _paused = function paused(key) {
    return _exists(key) && metadata[key].paused;
  }; // pause our execution countdown until we're ready for it to resume


  var _pause = function pause(key) {
    if (!metadata[key] || _paused(key)) return false;

    _clear(key, false);

    metadata[key].paused = true;
    metadata[key].timeSpentWaiting = new Date().getTime() - metadata[key].startTime;
    return metadata[key].timeSpentWaiting;
  };

  var _resume = function resume(key) {
    if (!metadata[key]) return false;
    var _metadata$key = metadata[key],
        func = _metadata$key.func,
        ms = _metadata$key.ms,
        params = _metadata$key.params,
        paused = _metadata$key.paused,
        timeSpentWaiting = _metadata$key.timeSpentWaiting;
    if (!paused) return false;
    var remainingTime = ms - timeSpentWaiting;
    return _set.apply(void 0, [key, func, remainingTime].concat(_toConsumableArray(params)));
  };

  var _remaining = function remaining(key) {
    if (!metadata[key]) return 0;
    var _metadata$key2 = metadata[key],
        ms = _metadata$key2.ms,
        startTime = _metadata$key2.startTime,
        timeSpentWaiting = _metadata$key2.timeSpentWaiting;
    return _paused(key) ? ms - timeSpentWaiting : Math.max(0, startTime + ms - new Date().getTime());
  };

  var _restart = function restart(key) {
    if (!metadata[key]) return false;
    var _metadata$key3 = metadata[key],
        func = _metadata$key3.func,
        params = _metadata$key3.params,
        paused = _metadata$key3.paused;

    _clear(key, false);

    if (paused) {
      metadata[key].paused = false;
    }

    return _set.apply(void 0, [key, func, originalMs[key]].concat(_toConsumableArray(params)));
  };

  var instantiate = function instantiate(ctorFunc) {
    var ctorMs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!ctorFunc) {
      throw Error('Timeout.instantiate() requires a function parameter');
    }

    var key = "".concat(Math.random()).concat(ctorFunc).replace(/\s/g, '');

    for (var _len3 = arguments.length, ctorCallbackParams = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      ctorCallbackParams[_key3 - 2] = arguments[_key3];
    }

    _set.apply(void 0, [key, ctorFunc, ctorMs].concat(ctorCallbackParams));

    return {
      clear: function clear() {
        var erase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return _clear(key, erase);
      },
      executed: function executed() {
        return _executed(key);
      },
      exists: function exists() {
        return _exists(key);
      },
      pause: function pause() {
        return _pause(key);
      },
      paused: function paused() {
        return _paused(key);
      },
      pending: function pending() {
        return _pending(key);
      },
      remaining: function remaining() {
        return _remaining(key);
      },
      restart: function restart() {
        return _restart(key);
      },
      resume: function resume() {
        return _resume(key);
      },
      set: function set(newFunc) {
        var newMs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        for (var _len4 = arguments.length, newParams = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          newParams[_key4 - 2] = arguments[_key4];
        }

        return _set.apply(void 0, [key, newFunc, newMs].concat(newParams));
      }
    };
  };

  return {
    clear: _clear,
    create: create,
    executed: _executed,
    exists: _exists,
    instantiate: instantiate,
    pause: _pause,
    paused: _paused,
    pending: _pending,
    remaining: _remaining,
    restart: _restart,
    resume: _resume,
    set: _set
  };
}();

var _default = Timeout;
exports["default"] = _default;