const assert = require('assert');
const Timeout = require('.');

function my_timer() {
  console.log('-----');
  console.log('* entered my_timer!');

  console.log('Does my_timer still exist?', Timeout.exists('my_timer'));
  assert(Timeout.exists('my_timer'), 'my_timer should still exist');

  console.log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms');

  console.log('Is my_timer pending?', Timeout.pending('my_timer'));
  assert(!Timeout.pending('my_timer'), 'my_timer should no longer be pending');

  console.log('Has my_timer executed?', Timeout.executed('my_timer'));
  assert(Timeout.executed('my_timer'), 'my_timer should now have executed');

  console.log('Is my_timer paused?', Timeout.paused('my_timer'));
  assert(!Timeout.paused('my_timer'), 'my_timer should not be paused');

  console.log('* clearing my_timer');

  Timeout.clear('my_timer');

  console.log('Does my_timer still exist?', Timeout.exists('my_timer'));
  assert(!Timeout.exists('my_timer'), 'my_timer should no longer exist');

  console.log('Is my_timer pending?', Timeout.pending('my_timer'));
  assert(!Timeout.pending('my_timer'), 'my_timer should not be pending - it no longer exists');

  console.log('Is my_timer executed?', Timeout.pending('my_timer'));
  assert(!Timeout.executed('my_timer'), 'my_timer should not be executed - it no longer exists');

  console.log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms');

  console.log('-----');
}

function pause_my_timer() {
  console.log('-----');
  console.log('* pause_my_timer executing!');

  console.log('Pausing my_timer...');

  Timeout.pause('my_timer');

  console.log('Is my_timer paused now?', Timeout.paused('my_timer'));
  assert(Timeout.paused('my_timer'), 'my_timer should now be paused');

  console.log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms');

  console.log('* pause_my_timer ending');
  console.log('-----');
}

function unpause_my_timer() {
  console.log('-----');
  console.log('* unpause_my_timer executing!');

  console.log('Is my_timer paused now?', Timeout.paused('my_timer'));
  assert(Timeout.paused('my_timer'), 'my_timer should still be paused');

  console.log('Unpausing my_timer...');

  Timeout.resume('my_timer');

  console.log('Is my_timer paused now?', Timeout.paused('my_timer'));
  assert(!Timeout.paused('my_timer'), 'my_timer should no longer be paused');

  console.log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms');

  console.log('* unpause_my_timer ending');
  console.log('-----');
}

console.log('Setting my_timer to execute in 3 seconds.');

Timeout.set('my_timer', my_timer, 3000);

console.log('Does my_timer exist?', Timeout.exists('my_timer'));
assert(Timeout.exists('my_timer'), 'my_timer should exist');

console.log('Is my_timer pending?', Timeout.pending('my_timer'));
assert(Timeout.pending('my_timer'), 'my_timer should be pending');

console.log('Has my_timer executed?', Timeout.executed('my_timer'));
assert(!Timeout.executed('my_timer'), 'my_timer should not yet have executed');

console.log('Time remaining before executing my_timer:', Timeout.remaining('my_timer'), 'ms');

console.log('Setting unpause_my_timer to execute in 400 milliseconds.');
Timeout.set(unpause_my_timer, 400);

console.log('Setting pause_my_timer to execute in 200 milliseconds.');
Timeout.set(pause_my_timer, 200);
