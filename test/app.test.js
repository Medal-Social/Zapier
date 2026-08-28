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

  it('handles empty input values itself instead of letting the platform strip them', () => {
    assert.equal(App.flags.cleanInputData, false);
  });

  it('backs every id input field with its dynamic dropdown', () => {
    const expected = [
      [App.creates.update_contact, 'contact_id', 'list_contacts.id.display_name'],
      [App.creates.add_note, 'contact_id', 'list_contacts.id.display_name'],
      [App.creates.update_deal, 'deal_id', 'list_deals.id.display_name'],
      [App.creates.schedule_post, 'post_id', 'list_posts.id.display_name'],
      [App.creates.create_post, 'channel_ids', 'list_channels.id.display_name'],
    ];

    for (const [action, key, dynamic] of expected) {
      const field = action.operation.inputFields.find((candidate) => candidate.key === key);
      assert.equal(field.dynamic, dynamic, `${action.key}.${key}`);
    }
  });

  it('registers a dropdown trigger behind every dynamic reference', () => {
    const referenced = new Set();
    for (const action of [...Object.values(App.creates), ...Object.values(App.searches)]) {
      for (const field of action.operation.inputFields || []) {
        if (field.dynamic) referenced.add(field.dynamic.split('.')[0]);
      }
    }

    assert.deepEqual([...referenced].sort(), [
      'list_channels',
      'list_contacts',
      'list_deals',
      'list_posts',
    ]);
    for (const key of referenced) {
      assert.ok(App.triggers[key], `missing trigger for dynamic dropdown "${key}"`);
    }
  });
});
