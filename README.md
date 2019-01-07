# Timeout
Interactive, stateful JS (ES6) timeout interface

The `setTimeout()` and `clearTimeout()` primitives are fine for basic functionality, but they leave much to be desired. For example, JS provides no means by which to test if a timeout has finished executing, still waiting to be executed, or if has been cleared.

The `Timeout` object seeks to improve the situation by allowing you to:
* set and clear timeouts the same way you've always done
* check if a particular timeout has been created or cleared
* check if a timeout is pending execution or if it has already executed

You can use a human-readable identifier to uniquely identify a timeout or the callback itself will be used as its own unique identifier. Checkout the examples below. You can also play around with a demo at [this CodePen](http://codepen.io/rommelsantor/pen/Pbepde) and read a little more at [this Medium article](https://hackernoon.com/smarter-javascript-timeouts-24308f3be5ab).

## Install

* npm install smart-timeout
* `import Timeout from 'smart-timeout'` -or- `const Timeout = require('smart-timeout');`

## Methods:
* `Timeout.set(keyName, function, millisecs = 0, param1, param2, ...)` - schedule `function` to execute after `millisecs`, identified by `keyName`
* `Timeout.set(function, millisecs = 0, param1, param2, ...)` - same as above, except identifiable by `function` itself
* `Timeout.exists(key)` - returns true if function has been defined and not erased, whether or not it has executed
* `Timeout.pending(key)` - returns true if function exists and has not yet executed
* `Timeout.remaining(key)` - returns milliseconds remaining in the countdown until execution
* `Timeout.executed(key)` - returns true if function exists and has executed
* `Timeout.pause(key)` - pauses a function that exists but has not yet executed
* `Timeout.paused(key)` - returns true if function exists and is currently paused
* `Timeout.resume(key)` - allows paused execution countdown to resume
* `Timeout.clear(key, erase = true)` - clears a scheduled countdown; by default, knowledge of its existence is erased

## v2 changes

* implementation has been refactored significantly
* `pause()`, `paused()`, `resume()` have been added - thanks to [Pedro Muller](https://github.com/pedrommuller) for the suggestion!
* `remaining()` added - returns milliseconds remaining until execution
* checking arguments to `set()` for a function rather than making assumptions about the params
* added default of `0` to the `ms` parameter of `set()`

## Example 1 - a simple timeout and its status
```
const announce = () => {
  console.log('!!! hello from inside announce() !!!')
}

const showStatus = () => {
  console.log('does a timeout exist for announce()?', Timeout.exists(announce))
  console.log('is announce pending?', Timeout.pending(announce))
  console.log('did announce execute?', Timeout.executed(announce))
}

console.log('--- before setting the timeout. status check:')
showStatus()

const ran = Timeout.set(announce, 1000)

console.log('--- just set the timeout. status check:')
showStatus()
console.log('ran() = ', ran())

Timeout.set(() => {
  console.log('--- 1 second elapsed. status check:')
  showStatus()
  console.log('ran() = ', ran())
  
  Timeout.clear(announce)
  
  console.log('--- cleared timeout. status check:')
  showStatus()
  console.log('ran() = ', ran())
  
}, 1000)
```

## Example 2 - event throttle
```
// use the callback as the key to set a timeout that does nothing but
// tracks whether the timeout has executed

const throttle = (delay, callback) =>
    (...args) =>
      !Timeout.pending(callback) && Timeout.set(callback, () => {}, delay)
        ? callback.apply(this, args)
        : null
        
const onScroll = () => {
  const isScrolled = $(window).scrollTop() > 0
  $('html').toggleClass('is-scrolled', isScrolled)
}

const onScrollThrottled = throttle(100, onScroll)
$(window).scroll(onScrollThrottled)
```
