const Timeout = (() => {
  const keyId = {}
  const originalMs = {}
  const metadata = {}

  const clear = (key, erase = true) => {
    clearTimeout(keyId[key])
    delete keyId[key]

    if (erase) {
      delete metadata[key]
      delete originalMs[key]
    }
  }

  // set(key, func, ms = 0, [param1, param2, ...]) -- user-defined key
  // set(func, ms = 0, [param1, param2, ...]) -- func used as key
  //
  // returns a function allowing you to test if it has executed
  const set = (...args) => {
    let key, func, ms, params

    if (args.length === 0) {
      throw Error('Timeout.set() requires at least one argument')
    }

    if (typeof args[1] === 'function') {
      [key, func, ms, ...params] = args
    } else {
      [func, ms, ...params] = args
      key = func.toString()
    }

    if (!func) {
      throw Error('Timeout.set() requires a function parameter')
    }

    clear(key)

    const invoke = () => (metadata[key] = false, func(...params))

    keyId[key] = setTimeout(invoke, ms || 0)
    originalMs[key] = originalMs[key] || ms

    metadata[key] = {
      func,
      key,
      ms,
      params,
      paused: false,
      startTime: new Date().getTime(),
      timeSpentWaiting: 0,
    }

    return () => executed(key)
  }

  // timeout has been created
  const exists = key => key in keyId || metadata[key] !== undefined

  // same as set() except returns false if timeout already exists
  const create = (...args) => {
    if (args.length === 0) {
      throw Error('Timeout.create() requires at least one argument')
    }

    let key

    if (typeof args[1] === 'function') {
      [key] = args
    } else {
      const [func] = args
      key = func.toString()
    }

    return exists(key) ? false : set(...args)
  }

  // test if a timeout has run
  const executed = key => metadata[key] === false

  // timeout does exist, but has not yet run
  const pending = key => exists(key) && !executed(key)

  // timeout does exist, but will not execute because it is paused
  const paused = key => exists(key) && metadata[key].paused

  // pause our execution countdown until we're ready for it to resume
  const pause = key => {
    if (!metadata[key] || paused(key)) return false

    clear(key, false)

    metadata[key].paused = true
    metadata[key].timeSpentWaiting = new Date().getTime() - metadata[key].startTime

    return metadata[key].timeSpentWaiting
  }

  const resume = key => {
    if (!metadata[key]) return false

    const { func, ms, params, paused, timeSpentWaiting } = metadata[key]

    if (!paused) return false

    const remainingTime = ms - timeSpentWaiting
    return set(key, func, remainingTime, ...params)
  }

  const remaining = key => {
    if (!metadata[key]) return 0

    const { ms, startTime, timeSpentWaiting } = metadata[key]

    return paused(key)
      ? ms - timeSpentWaiting
      : Math.max(0, startTime + ms - new Date().getTime())
  }

  const restart = key => {
    if (!metadata[key]) return false

    const { func, params, paused } = metadata[key]

    clear(key, false)

    if (paused) {
      metadata[key].paused = false
    }

    return set(key, func, originalMs[key], ...params)
  }

  const instantiate = (ctorFunc, ctorMs = 0, ...ctorCallbackParams) => {
    if (!ctorFunc) {
      throw Error('Timeout.instantiate() requires a function parameter')
    }

    const key = `${Math.random()}${ctorFunc}`.replace(/\s/g, '')

    set(key, ctorFunc, ctorMs, ...ctorCallbackParams)

    return {
      clear: (erase = true) => clear(key, erase),
      executed: () => executed(key),
      exists: () => exists(key),
      pause: () => pause(key),
      paused: () => paused(key),
      pending: () => pending(key),
      remaining: () => remaining(key),
      restart: () => restart(key),
      resume: () => resume(key),
      set: (newFunc, newMs = 0, ...newParams) => set(key, newFunc, newMs, ...newParams),
    }
  }

  return {
    clear,
    create,
    executed,
    exists,
    instantiate,
    pause,
    paused,
    pending,
    remaining,
    restart,
    resume,
    set,
  }
})()

export default Timeout
