
const Timeout = (() => {
  const keyId = {}
  const complete = {}
  const milliseconds = {}
  const funcs = {}
  // set(key, func, ms) -- user-defined key
  // set(func, ms) -- func used as key
  //
  // returns a function allowing you to test if it has executed
  const set = (...args) => {
    let key, func, ms, total_time_run

    if (args.length == 3)
      [key, func, ms] = args
    else {
      [func, ms] = args
      key = func
    }

    clear(key)
    const invoke = () => (complete[key] = true, func())
    keyId[key] = setTimeout(invoke, ms)
    funcs[key] = func
    milliseconds[key] = ms
    complete[key] = false

    return () => executed(key)
  }

  const clear = key => {
    clearTimeout(keyId[key])
    delete keyId[key]
    delete complete[key]
  }

  const _time_diff = (date1, date2) =>
    date2 ? date2 - date1 : new Date().getTime() - date1;


  // timeout has been created
  const exists = key => key in keyId

  // timeout does exist, but has not yet run
  const pending = key => exists(key) && !executed(key)

  const pause = (key) => {
    if (!pending(key)) return;
    clear(key);
    total_time_run = _time_diff(new Date().getTime());
    //executed 
  }

  const resume = key =>
    set(key, funcs[key], milliseconds[key] - total_time_run);;


  // test if a timeout has run
  const executed = key => key in complete && complete[key]

  return {
    set,
    clear,
    exists,
    pending,
    executed,
    pause,
    resume
  }
})()
