const assert = require('assert')
const Timeout = require('.')

const VERBOSE = process.env.VERBOSE

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

//
//
//

function test_manually_called() {
  log('----- test_manually_called -----')

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
}

function test_create_noclobber() {
  log('----- test_create_noclobber -----')

  log('Ensuring create() will not clobber an existing timeout')
  Timeout.set('no-clobber', function() { log('did not clobber') }, 0)
  assert(false === Timeout.create('no-clobber', function() { log('did not clobber') }, 0))
}

function test_static_methods() {
  log('----- test_static_methods -----')

  log('Setting my_timer to execute in 1 second.')
  Timeout.set('my_timer', my_timer, 1000)

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
}

function test_elapsed() {
  log('----- test_elapsed -----')

  Timeout.set('my_elapsed', () => {}, 10)

  setTimeout(() => {
    assert(Timeout.executed('my_elapsed') === true, 'elapsed timeout executed')
    assert(Timeout.elapsed('my_elapsed') >= 15, 'elapsed time counts since creation') 
  }, 15)
}

function test_reset() {
  log('----- test_reset -----')

  log('Setting my_reset to execute in 5 milliseconds')
  Timeout.set('my_reset', () => log('my_reset executed!'), 5)

  setTimeout(() => {
    assert(Timeout.executed('my_reset') === false, 'timeout has not yet executed')

    let meta = Timeout.meta('my_reset')
    const initialCallback = meta.callback

    assert(meta.ms === 5, 'initial ms is 5, as per set()')
    assert(meta.params.length === 0, 'initial params is empty, as per set()')

    Timeout.reset('my_reset', 0, 'a', 'b', 'c')

    meta = Timeout.meta('my_reset')

    assert(meta.callback === initialCallback, 'callback did not change after reset')
    assert(Timeout.executed('my_reset') === false, 'timeout has still not yet executed')
    assert(meta.ms === 0, 'reset ms is now 0')
    assert(meta.params.length === 3, 'reset params is non-empty')

    Timeout.pause('my_reset')
  }, 1)
}

function test_restart_after_pause() {
  log('----- test_restart_after_pause -----')

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

  setTimeout(() => {
    assert(Timeout.executed('my_restart_after_pause'), 'should already have executed')
    assert(Timeout.restart('my_restart_after_pause') === false, 'should not allow restart if already executed by default')
    assert(Timeout.restart('my_restart_after_pause', true) !== false, 'should allow restart if already executed with force option')
  }, 301)
}

function test_restart_after_pause_and_resume() {
  log('----- test_restart_after_pause_and_resume -----')

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
}

//
// test instantiated object without key
//

function test_instantiate_without_key() {
  log('----- test_instantiate_without_key -----')

  log('Instantiating with my_timer_with_params to execute in 1 second.')

  const obj = Timeout.instantiate(my_timer_with_params, 1000, 'Abc', 'Xyz')

  log('Does my_timer_with_params exist?', obj.exists())
  assert(obj.exists(), 'my_timer_with_params should exist')

  log('Is my_timer_with_params pending?', obj.pending())
  assert(obj.pending(), 'my_timer_with_params should be pending')

  log('Has my_timer_with_params executed?', obj.executed())
  assert(!obj.executed(), 'my_timer_with_params should not yet have executed')

  log('Time remaining before executing my_timer_with_params:', obj.remaining(), 'ms')
}

//
// test instantiated object with manual key
//

function test_instantiate_with_key() {
  log('----- test_instantiate_with_key -----')

  log('Instantiating with my_timer_with_params')

  const obj1 = Timeout.instantiate('my_object_id', my_timer_with_params, 1000, 'Abc', 'Xyz')
  assert(Timeout.exists('my_object_id'), 'instantiated by key should exist statically')

  const initialCallback = obj1.meta().callback

  const obj2 = Timeout.instantiate('my_object_id')
  assert(obj1.meta() === obj2.meta(), 'instantiated with key only should link to existing object')

  assert(obj1.paused() === false, 'newly instantiated object should not be paused')
  assert(obj2.paused() === false, 'second instantiated object should not be paused')
  assert(Timeout.paused('my_object_id') === false, 'static check should not yield paused')
  obj2.pause()
  assert(Timeout.paused('my_object_id') === true, 'static check should yield paused')
  assert(obj2.paused() === true, 'second instantiated object should be paused after pausing')
  assert(obj1.paused() === true, 'first instantiated object should be paused after pausing the second')

  const obj3 = Timeout.instantiate('my_object_id', () => {})
  assert(obj3.meta().callback !== initialCallback, 'new instantiation replaces the existing callback')

  const obj4 = Timeout.instantiate(() => {})
  assert(obj4.meta() !== undefined, 'instantiating with just a callback yields valid metadata')
}

function test_instantiate_linked_to_static() {
  log('----- test_instantiate_linked_to_static -----')

  const callback = () => {}

  Timeout.set('static_timer', callback, 1234)

  const obj = Timeout.instantiate('static_timer')

  assert(obj.meta().callback === callback, 'the linked object should have the same callback')
  assert(obj.meta().ms === 1234, 'the linked object should have the same millisecs')
  assert(obj.meta() === Timeout.meta('static_timer'), 'the linked metadata should be the same as the static')
}

//
//
//

test_manually_called()
test_create_noclobber()
test_static_methods()
test_elapsed()
test_reset()
test_restart_after_pause()
test_restart_after_pause_and_resume()
test_instantiate_without_key()
test_instantiate_with_key()
test_instantiate_linked_to_static()

console.log('tests complete.')

