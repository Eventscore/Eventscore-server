const test = require('tape');

test('server should be up', (assert) => {
  const testvar = true;
  assert.equal(testvar, true);
  assert.end();
});
