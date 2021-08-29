const assert = require('assert')
const Timeout = require('.')

const VERBOSE = false

assert(typeof Timeout.set === 'function', 'Timeout should have been imported correctly from index.js')

function log(/* ... */) {
  if (!VERBOSE) return

  console.log.apply(null, arguments)
}

function isAround(actual, expected) {
  return actual >= expected - 1 && actual <= expected + 1
}

function manually_called() {
  return 'i was manually called'
}

function my_timer(param1, param2, param3) {
  log('-----')
  log('* entered my_timer!')

  log('Does my_timer still exist?', Timeout.exists('my_timer'))
  assert(Timeout.exists('my_timer'), 'my_timer should still exist')

  log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms')

  log('Is my_timer pending?', Timeout.pending('my_timer'))
  assert(!Timeout.pending('my_timer'), 'my_timer should no longer be pending')

  log('Has my_timer executed?', Timeout.executed('my_timer'))
  assert(Timeout.executed('my_timer'), 'my_timer should now have executed')

  let lastExec = Timeout.lastExecuted('my_timer')
  log('When was the last time my_timer executed?', lastExec)
  console.assert(!!lastExec, 'my_timer last execution should not be empty')

  log('Is my_timer paused?', Timeout.paused('my_timer'))
  assert(!Timeout.paused('my_timer'), 'my_timer should not be paused')

  log('* clearing my_timer')

  Timeout.clear('my_timer')

  log('Does my_timer still exist?', Timeout.exists('my_timer'))
  assert(!Timeout.exists('my_timer'), 'my_timer should no longer exist')

  log('Is my_timer pending?', Timeout.pending('my_timer'))
  assert(!Timeout.pending('my_timer'), 'my_timer should not be pending - it no longer exists')

  log('Is my_timer executed?', Timeout.pending('my_timer'))
  assert(!Timeout.executed('my_timer'), 'my_timer should not be executed - it no longer exists')

  log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms')

  log('-----')

  return 'executed my_timer'
}

function pause_my_timer() {
  log('-----')
  log('* pause_my_timer executing!')

  log('Pausing my_timer...')

  Timeout.pause('my_timer')

  log('Is my_timer paused now?', Timeout.paused('my_timer'))
  assert(Timeout.paused('my_timer'), 'my_timer should now be paused')

  log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms')

  log('* pause_my_timer ending')
  log('-----')
}

function unpause_my_timer() {
  log('-----')
  log('* unpause_my_timer executing!')

  log('Is my_timer paused now?', Timeout.paused('my_timer'))
  assert(Timeout.paused('my_timer'), 'my_timer should still be paused')

  log('Unpausing my_timer...')

  Timeout.resume('my_timer')

  log('Is my_timer paused now?', Timeout.paused('my_timer'))
  assert(!Timeout.paused('my_timer'), 'my_timer should no longer be paused')

  log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms')

  log('* unpause_my_timer ending')
  log('-----')
}

function my_timer_with_params(param1, param2, param3) {
  log('-----')
  log('* entered my_timer_with_params!')

  log('* my_timer_with_params got param1:', param1)
  assert(typeof param1 !== 'undefined', 'my_timer_with_params param1 should be defined')

  log('* my_timer_with_params got param2:', param2)
  assert(typeof param2 !== 'undefined', 'my_timer_with_params param2 should be defined')

  log('* my_timer_with_params got param3:', param3)
  assert(typeof param3 === 'undefined', 'my_timer_with_params param3 should be UNdefined')
}

Timeout.set('manually_called', manually_called, 100)
assert(Timeout.exists('manually_called'), 'manually_called should exist')
assert(Timeout.pending('manually_called'), 'manually_called should be pending')
assert(!Timeout.executed('manually_called'), 'manually_called should be flagged as not yet executed')

let callResult
log('One-off execution of the manually_called callback does not affect existing timeout', callResult = Timeout.call('manually_called'))
assert(callResult === 'i was manually called', 'manually_called\'s return value should have been received, but got: ' + callResult)
assert(Timeout.exists('manually_called'), 'manually_called should still exist')
assert(Timeout.pending('manually_called'), 'manually_called should still be pending')
assert(!Timeout.executed('manually_called'), 'manually_called should still be flagged as not yet executed')

log('Ensuring create() will not clobber an existing timeout')
Timeout.set('no-clobber', function() { log('did not clobber') }, 0)
assert(false === Timeout.create('no-clobber', function() { log('did not clobber') }, 0))

log('Setting my_timer_with_params to execute in 0 ms with two parameters: "Foo" and "Bar"')
Timeout.set(my_timer_with_params, 0, 'Foo', 'Bar')

log('Setting my_timer to execute in 3 seconds.')
Timeout.set('my_timer', my_timer, 3000)

log('Does my_timer exist?', Timeout.exists('my_timer'))
assert(Timeout.exists('my_timer'), 'my_timer should exist')

log('Is my_timer pending?', Timeout.pending('my_timer'))
assert(Timeout.pending('my_timer'), 'my_timer should be pending')

log('Has my_timer executed?', Timeout.executed('my_timer'))
assert(!Timeout.executed('my_timer'), 'my_timer should not yet have executed')

log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms')

log('Setting unpause_my_timer to execute in 400 milliseconds.')
Timeout.set(unpause_my_timer, 400)

log('Setting pause_my_timer to execute in 200 milliseconds.')
Timeout.set(pause_my_timer, 200)

log('-----')
log('Setting my_restart_after_pause to execute in 100 milliseconds, but will pause after 50 ms')
Timeout.set('my_restart_after_pause', () => log('my_restart_after_pause executed!'), 100)
setTimeout(() => {
  log('Pausing my_restart_after_pause')
  Timeout.pause('my_restart_after_pause')

  log('Restarting my_restart_after_pause')
  Timeout.restart('my_restart_after_pause')

  log('my_restart_after_pause remaining time after restarting =', Timeout.remaining('my_restart_after_pause'))
  assert(
    isAround(Timeout.remaining('my_restart_after_pause'), 100),
    'my_restart_after_pause should be set to 100ms after pausing and restarting but was ' + Timeout.remaining('my_restart_after_pause')
  )
}, 50)

log('-----')
log('Setting restart_after_pause_and_resume to execute in 100 milliseconds, but will pause after 25 ms')
Timeout.set('restart_after_pause_and_resume', () => log('restart_after_pause_and_resume executed!'), 100)
setTimeout(() => {
  log('Pausing restart_after_pause_and_resume')
  Timeout.pause('restart_after_pause_and_resume')

  setTimeout(() => {
    log('Resuming restart_after_pause_and_resume')
    Timeout.resume('restart_after_pause_and_resume')

    log('Restarting restart_after_pause_and_resume after resuming')
    Timeout.restart('restart_after_pause_and_resume')

    log('restart_after_pause_and_resume remaining time after restarting =', Timeout.remaining('restart_after_pause_and_resume'))
    assert(
      isAround(Timeout.remaining('restart_after_pause_and_resume'), 100),
      'restart_after_pause_and_resume should be set to 100ms after pausing and restarting but was ' + Timeout.remaining('restart_after_pause_and_resume')
    )
  }, 25)
}, 25)

//
// test instantiated object
//

log('-----')
log('Instantiating with my_timer_with_params to execute in 3 seconds.')

const obj = Timeout.instantiate(my_timer_with_params, 2000, 'Abc', 'Xyz')

log('Does my_timer_with_params exist?', obj.exists())
assert(obj.exists(), 'my_timer_with_params should exist')

log('Is my_timer_with_params pending?', obj.pending())
assert(obj.pending(), 'my_timer_with_params should be pending')

log('Has my_timer_with_params executed?', obj.executed())
assert(!obj.executed(), 'my_timer_with_params should not yet have executed')

log('Time remaining before executing my_timer_with_params:', obj.remaining(), 'ms')

console.log('tests complete.')

