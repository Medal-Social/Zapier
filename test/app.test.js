const assert = require('node:assert/strict');
const App = require('../index');

describe('Zapier app definition', () => {
  it('uses oauth2 authentication', () => {
    assert.equal(App.authentication.type, 'oauth2');
  });

  it('registers expected creates', () => {
    assert.ok(App.creates.create_contact);
    assert.ok(App.creates.update_contact);
    assert.ok(App.creates.add_note);
    assert.ok(App.creates.create_deal);
    assert.ok(App.creates.update_deal);
    assert.ok(App.creates.create_post);
    assert.ok(App.creates.schedule_post);
  });

  it('registers expected searches', () => {
    assert.ok(App.searches.workspace);
    assert.ok(App.searches.find_contact);
    assert.ok(App.searches.find_deal);
  });
});
