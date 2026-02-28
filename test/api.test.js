const assert = require('node:assert/strict');
const { medalRequest } = require('../lib/api');

describe('medalRequest helper', () => {
  it('adds workspace header by default', async () => {
    let requestPayload;
    const z = {
      request: async (request) => {
        requestPayload = request;
        return { status: 200, data: { data: [] } };
      },
    };

    await medalRequest(
      z,
      {
        authData: {
          access_token: 'token_123',
          workspace_id: 'workspace_abc',
        },
      },
      { method: 'GET', path: '/api/v1/contacts' }
    );

    assert.equal(requestPayload.headers['X-Workspace-Id'], 'workspace_abc');
  });

  it('omits workspace header when includeWorkspaceHeader is false', async () => {
    let requestPayload;
    const z = {
      request: async (request) => {
        requestPayload = request;
        return { status: 200, data: { data: [] } };
      },
    };

    await medalRequest(
      z,
      {
        authData: {
          access_token: 'token_123',
          workspace_id: 'workspace_abc',
        },
      },
      { method: 'GET', path: '/api/v1/me/workspaces', includeWorkspaceHeader: false }
    );

    assert.ok(!requestPayload.headers['X-Workspace-Id']);
  });
});
