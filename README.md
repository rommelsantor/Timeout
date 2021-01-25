# Timeout

Interactive, stateful timeouts

<a href="https://npmjs.com/package/smart-timeout" target="_blank">
  <img alt="" src="https://img.shields.io/npm/dm/smart-timeout.svg" />
</a>

<a href="https://bundlephobia.com/result?p=smart-timeout" target="_blank">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/smart-timeout" />
</a>

## Background

The `setTimeout()` and `clearTimeout()` primitives are fine for basic functionality, but they leave much to be desired. For example, JS provides no means by which to test if a timeout has finished executing, still waiting to be executed, if has been cleared, etc.

`Timeout` enhances and improves on native functionality by allowing you to:
* set and clear timeouts the same way you always have
* check if a timeout has already been created
* check if a timeout has been cleared
* check if a timeout is still pending execution
* check if a timeout has already executed
* pause a pending timeout's countdown
* determine the number of milliseconds remaining in a timeout's countdown
* restart a countdown in progress
* get the exact timestamp when the execution occurred

Checkout the examples below. You can also play around with a demo at [this CodePen](http://codepen.io/rommelsantor/pen/Pbepde) and read a little more at [this Medium article](https://hackernoon.com/smarter-javascript-timeouts-24308f3be5ab).

## Install

* `npm install smart-timeout`
* `yarn add smart-timeout`

## Import

* `import Timeout from 'smart-timeout'`
* `const Timeout = require('smart-timeout');`

## Usage

We must be able to uniquely identify every timeout. You can define an explicit, human-readable key or you can default to allowing the callback function itself to be implicitly used as its identifier.

### Static

* `Timeout.set(keyName, callback, millisecs = 0, param1, param2, ...)`
  * explicitly identify timeout by `keyName`
  * schedule `callback` to execute after `millisecs`
  * additional params will be passed to `callback` when it is executed
* `Timeout.set(callback, millisecs = 0, param1, param2, ...)`
  * implicitly identify timeout by `callback`
  * schedule `callback` to execute after `millisecs`
  * additional params will be passed to `callback` when it is executed
* `Timeout.create(...)`
  * identical to `set()` above, except it will not set the timeout if `key` already exists
  * returns `false` without setting the timeout if a timeout for `key` exists (whether or not it has executed)
  * note: `clear()` must be called to `create()` the same timeout again
* `Timeout.exists(key)`
  * returns true if timeout exists for `key` and is not erased, whether or not it has executed
* `Timeout.pending(key)`
  * returns true if timeout exists for `key` and has not yet executed
* `Timeout.remaining(key)`
  * returns milliseconds remaining in the countdown until the callback executes
* `Timeout.executed(key)`
  * returns true if timeout exists for `key` and has already executed
* `Timeout.lastExecuted(key)`
  * returns a Date object of the last time the timeout for `key` executed
* `Timeout.pause(key)`
  * pauses the timeout identified by `key` if it exists and has not yet executed
* `Timeout.paused(key)`
  * returns true if timeout for `key` exists and is currently paused
* `Timeout.restart(key)`
  * restart the countdown with the original millisecs of a pending or paused timeout identified by `key`
* `Timeout.resume(key)`
  * allows the countdown of a paused timeout identified by `key` to resume
* `Timeout.clear(key, erase = true)`
  * clears the timeout identified by `key`
  * by default, knowledge of its existence is erased

### Instantiated

* `Timeout.instantiate(callback, millisecs = 0, param1, param2, ...)`
  * creates a `Timeout` instance, which can be used as a handle for the timeout
  * this mitigates the need to pass a `key` for every method and makes transportable the management of a given timeout
  * _note: an explicit key is not supported for an instantiated object as that would defeat its purpose_

Once you have an instantiated timeout, you can use that object to execute all the static methods described above, except without a `key` parameter.

#### Example

```js
const timeout = Timeout.instantiate(() => { return 'foo bar' }, 1500)
timeout.exists() // true
timeout.executed() // false
// now `timeout` can be passed around and managed without you having the key or callback in hand
```

## Example 1 - static

```js
// timeout with explicit key - useful for an anonymous callback
Timeout.set('myTimeout', () => { doStuff() }, 1000)
Timeout.exists('myTimeout') // true

// timeout with implicit key
Timeout.set(myCallback, 2000)
Timeout.exists(myCallback) // true
Timeout.remaining(myCallback) // 1999
```

## Example 2 - instantiate

```js
const timeout = Timeout.instantiate(() => { doSomething() }, 3000)
timeout.exists() // true
timeout.pause()
```

### Example 3 - create

Scenario: one or more files can be uploaded concurrently. Callback executes after each file upload completes.

If all uploads finish, we want to refetch the list of files immediately to reflect the newly uploaded files.

If there are several files that complete sequentially, we don't want to keep refetching the file list,
but we also don't want the file list to just wait and get stale if one big upload take a long time, so if other
uploads are still in progress wait 1500ms then refetch.

The effect is either we'll refetch when the last upload completes or we'll refetch at most once every 1500ms
after a file completes while other uploads continue.

```js
// called when a single upload finishes (whether or not there are still others in progress)
function onFinishUploadingSingleFile() {
  const refetchTimeoutKey = 'concurrent-refetch-after-upload'

  // this was the last upload in progress - refetch the file list immediately
  if (totalFilesStillUploading === 0) {
    api.refetch('/files-list')

    // kill any scheduled concurrent refetch; it's no longer necessary,
    // and we need to allow it to run again
    Timeout.clear(refetchTimeoutKey)
  } else {
    // this means we *will* execute the timeout callback once and only once
    // in 1500ms (unless clear() is called), even with other uploads still in progress
    Timeout.create(
      refetchTimeoutKey,
      () => {
        // we timed out, so refetch the list, even with other files still uploading
        api.refetch('/files-list')

        // be sure to clear() or this next Timeout.create() will fail
        Timeout.clear(refetchTimeoutKey)
      },
      1500
    )
  }
}
```

## Example 4 - throttle DOM events

```js
// use the callback as implicit key to set a timeout that itself executes nothing;
// it just tracks whether or not the callback has executed

const noop = () => {}

const throttle = (callback, delay) =>
  (...args) =>
    !Timeout.pending(callback) &&
    Timeout.set(callback, noop, delay) &&
    callback(...args)

const onScroll = () => {
  // do something with the scroll position
}

const onScrollThrottled = throttle(onScroll, 100)
document.addEventListener('scroll', onScrollThrottled)
```

## Thanks!

* `pause()`, `paused()`, `resume()` - thanks to [Pedro Muller](https://github.com/pedrommuller) for the suggestion!
* `restart()` - thanks to [Roli4711](https://github.com/Roli4711) for the suggestion!
* `instantiate()` - thanks to [Alec Hirsch](https://github.com/alechirsch) for the idea!
* Thanks to [Marcus Calidus](https://github.com/MarcusCalidus) for converting to TypeScript and adding `lastExecuted()`!

