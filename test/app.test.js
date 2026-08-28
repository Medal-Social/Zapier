const assert = require('node:assert/strict');
const App = require('../index');

describe('Zapier app definition', () => {
  it('uses oauth2 authentication', () => {
    assert.equal(App.authentication.type, 'oauth2');
  });

  it('requests every oauth scope the integration relies on', () => {
    const scopes = App.authentication.oauth2Config.scope.split(' ');

    assert.deepEqual(scopes, [
      'openid',
      'profile',
      'email',
      'offline_access',
      'workspace:read',
      'contacts:read',
      'contacts:write',
      'deals:read',
      'deals:write',
      'bookings:read',
      'bookings:write',
      'posts:read',
      'posts:write',
      'channels:read',
    ]);
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
