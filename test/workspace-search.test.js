const assert = require('node:assert/strict');
const workspaceSearch = require('../searches/workspace');

describe('workspace search', () => {
  it('filters workspaces by name', async () => {
    const z = {
      request: async () => ({
        status: 200,
        data: {
          data: [
            { id: 'ws_1', name: 'Acme', slug: 'acme' },
            { id: 'ws_2', name: 'Beta Team', slug: 'beta' },
          ],
        },
      }),
    };

    const results = await workspaceSearch.operation.perform(z, {
      inputData: { name: 'ac' },
      authData: { access_token: 'token' },
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'ws_1');
  });
});
