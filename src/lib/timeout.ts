type Callback = (...params: any[]) => void

type Checker = () => boolean

interface KeyId {
  [key: string]: any
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

export class Timeout {
  private static keyId: KeyId = {}
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
   * timeout has been created
   * @param key
   */
  static exists(key: string): boolean {
    return key in Timeout.keyId || (Timeout.metadata)[key] !== undefined
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
   * restart timeout with original time
   * @param key
   */
  static restart(key: string): boolean | Checker {
    if (!Timeout.metadata[key] || Timeout.executed(key)) return false

    const metaDataRecord = Timeout.metadata[key]

    Timeout.clear(key, false)

    if (Timeout.paused) {
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

    const remainingTime = metaDataRecord.ms - metaDataRecord.timeSpentWaiting
    return Timeout.set(key, metaDataRecord.callback, remainingTime, ...metaDataRecord.params)
  }

  /**
   * instantiate timeout to handle as object
   * @param callback
   * @param ms
   * @param params
   */
  static instantiate(callback: Callback, ms: number = 0, ...params: any[]) {
    if (!callback) {
      throw Error('Timeout.instantiate() requires a function parameter')
    }

    const key = `${Math.random()}${callback}`.replace(/\s/g, '')

    Timeout.set(key, callback, ms, ...params)

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
      set: (newCallback: Callback, newMs = 0, ...newParams: any[]) => Timeout.set(key, newCallback, newMs, ...newParams),
    }
  }
}

