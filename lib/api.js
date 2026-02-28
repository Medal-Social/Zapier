const { DEFAULT_API_BASE_URL } = require('./constants');

const getBaseUrl = (_bundle) => {
  return DEFAULT_API_BASE_URL;
};

const getAccessToken = (bundle) => {
  if (!bundle || !bundle.authData) return undefined;
  return bundle.authData.access_token || bundle.authData.accessToken || undefined;
};

const getWorkspaceId = (bundle) => {
  return bundle.authData?.workspace_id || undefined;
};

const discoverWorkspaceId = async (z, bundle) => {
  const accessToken = getAccessToken(bundle);
  if (!accessToken) return undefined;

  const response = await z.request({
    method: 'GET',
    url: `${getBaseUrl(bundle)}/api/v1/me/workspaces`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status >= 400) return undefined;

  const workspaces = Array.isArray(response.data?.data) ? response.data.data : [];
  const firstWorkspaceId = workspaces[0]?.id ? String(workspaces[0].id) : undefined;

  if (firstWorkspaceId && bundle && bundle.authData && !bundle.authData.workspace_id) {
    bundle.authData.workspace_id = firstWorkspaceId;
  }

  return firstWorkspaceId;
};

const addDefaultHeaders = (request, _z, bundle) => {
  request.headers = request.headers || {};
  request.headers.Accept = request.headers.Accept || 'application/json';
  const accessToken = getAccessToken(bundle);
  if (accessToken && !request.headers.Authorization) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (request.body && !request.headers['Content-Type']) {
    request.headers['Content-Type'] = 'application/json';
  }
  return request;
};

const handleApiErrors = (response, z) => {
  if (response.status >= 400) {
    let message = `Medal API request failed (${response.status})`;
    let code = 'MEDAL_API_ERROR';

    if (response.data?.error) {
      message = response.data.error.message || message;
      code = response.data.error.code || code;
    }

    throw new z.errors.Error(message, code, response.status);
  }

  return response;
};

const medalRequest = async (z, bundle, options) => {
  const {
    method = 'GET',
    path,
    params,
    body,
    headers: customHeaders,
    includeWorkspaceHeader = true,
  } = options;

  const headers = { ...(customHeaders || {}) };
  let workspaceId = getWorkspaceId(bundle);
  if (includeWorkspaceHeader && !workspaceId) {
    workspaceId = await discoverWorkspaceId(z, bundle);
  }
  if (includeWorkspaceHeader && workspaceId) {
    headers['X-Workspace-Id'] = String(workspaceId);
  }

  const response = await z.request({
    method,
    url: `${getBaseUrl(bundle)}${path}`,
    params,
    body,
    headers,
  });

  return response.data;
};

module.exports = {
  addDefaultHeaders,
  getBaseUrl,
  getWorkspaceId,
  handleApiErrors,
  medalRequest,
};
