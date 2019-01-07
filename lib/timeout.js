"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var Timeout = function () {
  var keyId = {};
  var metadata = {};

  var clear = function clear(key) {
    var erase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    clearTimeout(keyId[key]);
    delete keyId[key];

    if (erase) {
      delete metadata[key];
    }
  }; // set(key, func, ms = 0, [param1, param2, ...]) -- user-defined key
  // set(func, ms = 0, [param1, param2, ...]) -- func used as key
  //
  // returns a function allowing you to test if it has executed


  var set = function set() {
    var key, func, ms, params;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 0) {
      throw Error('Timeout.set() requires at least one argument');
    }

    if (typeof args[0] === 'function') {
      func = args[0];
      ms = args[1];
      params = args.slice(2);
      key = func.toString();
    } else {
      key = args[0];
      func = args[1];
      ms = args[2];
      params = args.slice(3);
    }

    if (!func) {
      throw Error('Timeout.set() requires a function parameter');
    }

    clear(key);

    var invoke = function invoke() {
      return metadata[key] = false, func.apply(void 0, _toConsumableArray(params));
    };

    keyId[key] = setTimeout(invoke, ms || 0);
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
      return executed(key);
    };
  }; // timeout has been created


  var exists = function exists(key) {
    return key in keyId || metadata[key] !== undefined;
  }; // test if a timeout has run


  var executed = function executed(key) {
    return metadata[key] === false;
  }; // timeout does exist, but has not yet run


  var pending = function pending(key) {
    return exists(key) && !executed(key);
  }; // timeout does exist, but will not execute because it is paused


  var paused = function paused(key) {
    return exists(key) && metadata[key].paused;
  }; // pause our execution countdown until we're ready for it to resume


  var pause = function pause(key) {
    if (!metadata[key] || paused(key)) return false;
    clear(key, false);
    metadata[key].paused = true;
    metadata[key].timeSpentWaiting = new Date().getTime() - metadata[key].startTime;
    return metadata[key].timeSpentWaiting;
  };

  var resume = function resume(key) {
    if (!metadata[key]) return false;
    var _metadata$key = metadata[key],
        func = _metadata$key.func,
        ms = _metadata$key.ms,
        params = _metadata$key.params,
        paused = _metadata$key.paused,
        timeSpentWaiting = _metadata$key.timeSpentWaiting;
    if (!paused) return false;
    var remainingTime = ms - timeSpentWaiting;
    return set.apply(void 0, [key, func, remainingTime].concat(_toConsumableArray(params)));
  };

  var remaining = function remaining(key) {
    if (!metadata[key]) return 0;
    var _metadata$key2 = metadata[key],
        ms = _metadata$key2.ms,
        startTime = _metadata$key2.startTime,
        timeSpentWaiting = _metadata$key2.timeSpentWaiting;
    return paused(key) ? ms - timeSpentWaiting : Math.max(0, startTime + ms - new Date().getTime());
  };

  return {
    clear: clear,
    executed: executed,
    exists: exists,
    pause: pause,
    paused: paused,
    pending: pending,
    remaining: remaining,
    resume: resume,
    set: set
  };
}();

var _default = Timeout;
exports.default = _default;