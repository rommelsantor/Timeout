# Timeout
Interactive, stateful JS (ES6) timeout interface

The `setTimeout()` and `clearTimeout()` primitives are fine for basic functionality, but they leave much to be desired. For example, JS provides no means by which to test if a timeout has finished executing, still waiting to be executed, or if has been cleared.

The `Timeout` object seeks to improve the situation by allowing you to:
* set and clear timeouts the same way you've always done
* check if a particular timeout has been created
* check if a timeout is pending execution or if it has already executed

You can use a human-readable identifier to uniquely identify a timeout or the callback itself will be used as its own unique identifier.

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

setTimeout(() => {
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
const throttle = (waitMs, func) => (...args) =>
  !Timeout.pending(func) && Timeout.set(func, () => {}, waitMs) && func.apply(this, args)

const throttledScroll = throttle(100, event => {
  $('html').toggleClass('is-scrolled', $(window).scrollTop() > 0)
})

$(window).scroll(throttledScroll)
```
