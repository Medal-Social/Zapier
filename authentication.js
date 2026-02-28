const { DEFAULT_AUTH_BASE_URL, DEFAULT_TOKEN_BASE_URL, OAUTH_SCOPES } = require('./lib/constants');
const { medalRequest } = require('./lib/api');

const resolveWorkspace = (workspaces, workspaceId) => {
  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    return null;
  }

  if (workspaceId) {
    const selected = workspaces.find((workspace) => workspace.id === workspaceId);
    if (selected) return selected;
  }

  return workspaces[0];
};

const getClientAuthHeader = () => {
  const clientId = process.env.CLIENT_ID || '';
  const clientSecret = process.env.CLIENT_SECRET || '';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return `Basic ${credentials}`;
};

const exchangeToken = async (z, params) => {
  const body = new URLSearchParams(params).toString();
  const response = await z.request({
    method: 'POST',
    url: `${DEFAULT_TOKEN_BASE_URL}/api/auth/oauth2/token`,
    headers: {
      Authorization: getClientAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  return response.data;
};

const authentication = {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      url: `${DEFAULT_AUTH_BASE_URL}/api/auth/oauth2/authorize`,
      params: {
        client_id: '{{process.env.CLIENT_ID}}',
        response_type: 'code',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        state: '{{bundle.inputData.state}}',
        scope: OAUTH_SCOPES,
      },
    },
    getAccessToken: async (z, bundle) =>
      exchangeToken(z, {
        client_id: process.env.CLIENT_ID,
        code: bundle.inputData.code,
        code_verifier: bundle.inputData.code_verifier,
        grant_type: 'authorization_code',
        redirect_uri: bundle.inputData.redirect_uri,
      }),
    refreshAccessToken: async (z, bundle) =>
      exchangeToken(z, {
        client_id: process.env.CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: bundle.authData.refresh_token,
      }),
    scope: OAUTH_SCOPES,
    autoRefresh: true,
    enablePkce: true,
  },
  test: async (z, bundle) => {
    const response = await medalRequest(z, bundle, {
      method: 'GET',
      path: '/api/v1/me/workspaces',
      includeWorkspaceHeader: false,
    });

    const workspaces = Array.isArray(response?.data) ? response.data : [];
    const selected = resolveWorkspace(workspaces, bundle.authData?.workspace_id);
    if (!selected) {
      throw new z.errors.Error('This account has no available workspaces.', 'NO_WORKSPACES', 403);
    }

    return {
      id: selected.id,
      name: selected.name,
      workspace_id: selected.id,
    };
  },
  connectionLabel: '{{json.name}}',
};

module.exports = authentication;
