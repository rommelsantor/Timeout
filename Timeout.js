const Timeout = (() => {
  const keyId = {}
  const metadata = {}

  const clear = (key, erase = true) => {
    clearTimeout(keyId[key])
    delete keyId[key]

    if (erase) {
      delete metadata[key]
    }
  }

  // set(key, func, ms = 0) -- user-defined key
  // set(func, ms = 0) -- func used as key
  //
  // returns a function allowing you to test if it has executed
  const set = (...args) => {
    let key, func, ms

    if (args.length === 0) {
      throw Error('Timeout.set() requires at least one argument')
    }

    if (typeof args[0] === 'function') {
      [func, ms] = args
      key = func.toString()
    } else {
      [key, func, ms] = args
    }

    if (!func) {
      throw Error('Timeout.set() requires a function parameter')
    }

    clear(key)

    const invoke = () => (metadata[key] = false, func())

    keyId[key] = setTimeout(invoke, ms)

    metadata[key] = {
      func,
      key,
      ms,
      paused: false,
      startTime: new Date().getTime(),
      timeSpentWaiting: 0,
    }

    return () => executed(key)
  }

  // timeout has been created
  const exists = key => key in keyId || metadata[key] !== undefined

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

    const { func, ms, paused, timeSpentWaiting } = metadata[key]

    if (!paused) return false

    const remainingTime = ms - timeSpentWaiting
    return set(key, func, remainingTime)
  }

  return {
    clear,
    executed,
    exists,
    pause,
    paused,
    pending,
    resume,
    set,
  }
})()
