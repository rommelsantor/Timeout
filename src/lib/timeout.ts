type Callback = (...params: any[]) => void

type Checker = () => boolean

interface KeyId {
  [key: string]: any
}

interface Caller {
  [key: string]: Callback
}

interface OriginalMs {
  [key: string]: number
}

class MetadataRecord {
  public executedTime: number
  public paused = false
  public startTime = new Date().getTime()
  public timeSpentWaiting = 0

  constructor(
    public callback: Callback,
    public key: string,
    public ms: number,
    public params: any[],
  ) {
  }
}

interface Metadata {
  [key: string]: MetadataRecord
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

export class Timeout {
  private static keyId: KeyId = {}
  private static keyCall: Caller = {}
  private static originalMs: OriginalMs = {}
  private static metadata: Metadata = {}

  /**
   * clear timeout and optionally erase all knowledge of its existence
   * @param key
   * @param erase
   */
  static clear(key: string, erase: boolean = true) {
    clearTimeout(Timeout.keyId[key])
    delete Timeout.keyId[key]
    delete Timeout.keyCall[key]

    if (erase) {
      delete Timeout.metadata[key]
      delete Timeout.originalMs[key]
    }
  }

  /**
   * returns a function allowing you to test if it has executed
   * @param key
   * @param callback
   * @param ms
   * @param params
   */
  static set(key: string, callback: Callback, ms: number, ...params: any[]): Checker
  /**
   * returns a function allowing you to test if it has executed
   * @param callback
   * @param ms
   * @param params
   */
  static set(callback: Callback, ms: number, ...params: any[]): Checker
  static set(...args: any[]): Checker
  static set(...args: any[]): Checker {
    let key: string
    let ms: number
    let params: any[]
    let callback: Callback

    if (args.length === 0) {
      throw Error('Timeout.set() requires at least one argument')
    }

    if (typeof args[1] === 'function') {
      [key, callback, ms, ...params] = args
    } else {
      [callback, ms, ...params] = args
      key = callback.toString()
    }

    if (!callback) {
      throw Error('Timeout.set() requires a callback parameter')
    }

    Timeout.clear(key)

    const invoke = () => {
      Timeout.metadata[key].executedTime = new Date().getTime()
      callback(...params)
    }

    Timeout.keyId[key] = setTimeout(invoke, ms || 0)
    Timeout.keyCall[key] = () => callback(...params)
    Timeout.originalMs[key] = Timeout.originalMs[key] || ms

    Timeout.metadata[key] = new MetadataRecord(
      callback,
      key,
      ms,
      params
    )

    return () => Timeout.executed(key)
  }

  /**
   * same as set() except returns false if timeout already exists
   * @param key
   * @param callback
   * @param ms
   * @param params
   */
  static create(key: string, callback: Callback, ms: number, ...params: any[]): boolean | Checker
  /**
   * same as set() except returns false if timeout already exists
   * @param callback
   * @param ms
   * @param params
   */
  static create(callback: Callback, ms: number, ...params: any[]): boolean | Checker
  static create(...args: any[]): boolean | Checker {
    if (args.length === 0) {
      throw Error('Timeout.create() requires at least one argument')
    }

    let key: string

    if (typeof args[1] === 'function') {
      [key] = args
    } else {
      const [callback] = args
      key = callback.toString()
    }

    return Timeout.exists(key) ? false : Timeout.set(...args)
  }

  /**
   * elapsed time since the timeout was created
   * @param key
   */
  static elapsed(key: string): number {
    const metaDataRecord = Timeout.metadata[key]

    if (!metaDataRecord) return 0

    return Math.max(0, new Date().getTime() - metaDataRecord.startTime)
  }

  /**
   * timeout has been created
   * @param key
   */
  static exists(key: string): boolean {
    return key in Timeout.keyId || (Timeout.metadata)[key] !== undefined
  }

  /**
   * fire the callback on demand, without affecting the timeout or meta data (execution time)
   * @param key
   * @returns {(false|any)} false if timeout does not exist or the return value of the callback
   */
  static call(key: string): any {
    return Timeout.exists(key) && (Timeout.keyCall)[key]()
  }

  /**
   * test if a timeout has run
   * @param key
   */
  static executed(key: string): boolean {
    return Timeout.exists(key) && !!Timeout.metadata[key].executedTime
  }

  /**
   * when timeout was last executed
   * @param key
   */
  static lastExecuted(key: string): Date {
    return !Timeout.executed(key)
      ? null
      : new Date(Timeout.metadata[key].executedTime)
  }

  /**
   * metadata about a timeout
   * @param key
   */
  static meta(key: string): MetadataRecord {
    return Timeout.metadata[key]
  }

  /**
   * timeout does exist, but has not yet run
   * @param key
   */
  static pending(key: string): boolean {
    return Timeout.exists(key) && !Timeout.executed(key)
  }

  /**
   * timeout does exist, but will not execute because it is paused
   * @param key
   */
  static paused(key: string): boolean {
    return Timeout.exists(key)
      && !Timeout.executed(key)
      && Timeout.metadata[key].paused
  }

  /**
   * remaining time until timeout will occur
   * @param key
   */
  static remaining(key: string): number {
    if (!Timeout.metadata[key]) return 0

    const metaDataRecord = Timeout.metadata[key]

    return Timeout.paused(key)
      ? metaDataRecord.ms - metaDataRecord.timeSpentWaiting
      : Math.max(0, metaDataRecord.startTime + metaDataRecord.ms - new Date().getTime())
  }

  /**
   * set timeout anew, optionally with new time and params
   * @param key
   * @param ms new millisecs before execution
   * @param params new parameters to callback
   */
  static reset(key: string, ms: number, ...params: any[]): boolean | Checker {
    const metaDataRecord = Timeout.metadata[key]

    if (!metaDataRecord) return false

    Timeout.clear(key, false)

    if (metaDataRecord.paused) {
      metaDataRecord.paused = false
    }

    return Timeout.set(
      key,
      metaDataRecord.callback,
      ms ?? Timeout.originalMs[key],
      ...(params || metaDataRecord.params),
    )
  }

  /**
   * restart timeout with original time
   * @param key
   * @param force restart even even if not yet executed
   */
  static restart(key: string, force: boolean = false): boolean | Checker {
    if (!Timeout.metadata[key] || (!force && Timeout.executed(key))) return false

    const metaDataRecord = Timeout.metadata[key]

    Timeout.clear(key, false)

    if (metaDataRecord.paused) {
      metaDataRecord.paused = false
    }

    return Timeout.set(key, metaDataRecord.callback, Timeout.originalMs[key], ...metaDataRecord.params)
  }

  /**
   * pause our execution countdown until we're ready for it to resume
   * @param key
   */
  static pause(key: string): boolean | number {
    if (!Timeout.metadata[key] || Timeout.paused(key) || Timeout.executed(key)) return false

    Timeout.clear(key, false)

    const metaDataRecord = Timeout.metadata[key]

    metaDataRecord.paused = true
    metaDataRecord.timeSpentWaiting = new Date().getTime() - metaDataRecord.startTime

    return metaDataRecord.timeSpentWaiting
  }

  /**
   * resume paused Timeout with the remaining time
   * @param key
   */
  static resume(key: string): boolean | Checker {
    if (!Timeout.metadata[key] || Timeout.executed(key)) return false

    const metaDataRecord = Timeout.metadata[key]

    if (!metaDataRecord.paused) return false

    const originalMs = Timeout.originalMs[key]
    const remainingTime = metaDataRecord.ms - metaDataRecord.timeSpentWaiting

    const result = Timeout.set(key, metaDataRecord.callback, remainingTime, ...metaDataRecord.params)

    Timeout.originalMs[key] = originalMs

    return result
  }

  /**
   * instantiate timeout to handle as object
   * @param key
   * @param callback
   * @param ms
   * @param params
   */
  static instantiate(key: string, callback: Callback, ms: number, ...params: any[]): TimeoutInstance
  /**
   * instantiate timeout to handle as object
   * @param callback
   * @param ms
   * @param params
   */
  static instantiate(callback: Callback, ms: number, ...params: any[]): TimeoutInstance
  static instantiate(...args: any[]): TimeoutInstance
  static instantiate(...args: any[]): TimeoutInstance {
    let key: string
    let ms: number
    let params: any[]
    let callback: Callback

    if (args.length === 0) {
      throw Error('Timeout.set() requires at least one argument')
    }

    const linkToExisting: boolean = args.length === 1 && typeof args[0] !== 'function'

    // hooking up to an existing timeout
    if (linkToExisting) {
      [key] = args

      const metadata: MetadataRecord = Timeout.meta(key)

      if (!metadata) {
        return undefined
      }

      ms = metadata.ms
      params = metadata.params
      callback = metadata.callback
    } else if (typeof args[1] === 'function') {
      [key, callback, ms, ...params] = args
    } else {
      [callback, ms, ...params] = args
      key = `${Math.random()}${callback}`.replace(/\s/g, '')
    }

    if (!callback) {
      throw Error('Timeout.instantiate() requires a function parameter')
    }

    if (!linkToExisting) {
      Timeout.set(key, callback, ms, ...params)
    }

    return {
      call: () => Timeout.call(key),
      clear: (erase = true) => Timeout.clear(key, erase),
      elapsed: () => Timeout.elapsed(key),
      executed: () => Timeout.executed(key),
      exists: () => Timeout.exists(key),
      lastExecuted: () => Timeout.lastExecuted(key),
      meta: () => Timeout.meta(key),
      pause: () => Timeout.pause(key),
      paused: () => Timeout.paused(key),
      pending: () => Timeout.pending(key),
      remaining: () => Timeout.remaining(key),
      reset: (ms: number, ...params: any[]) => Timeout.reset(key, ms, ...params),
      restart: () => Timeout.restart(key),
      resume: () => Timeout.resume(key),
      set: (newCallback: Callback, newMs = 0, ...newParams: any[]) => Timeout.set(key, newCallback, newMs, ...newParams),
    }
  }
}
