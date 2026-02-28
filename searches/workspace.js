const { medalRequest } = require('../lib/api');

const perform = async (z, bundle) => {
  const response = await medalRequest(z, bundle, {
    method: 'GET',
    path: '/api/v1/me/workspaces',
    includeWorkspaceHeader: false,
  });

  const workspaces = Array.isArray(response?.data) ? response.data : [];
  const query = (bundle.inputData.name || '').trim().toLowerCase();

  if (!query) return workspaces;

  return workspaces.filter((workspace) => {
    const name = String(workspace.name || '').toLowerCase();
    const slug = String(workspace.slug || '').toLowerCase();
    return name.includes(query) || slug.includes(query);
  });
};

module.exports = {
  key: 'workspace',
  noun: 'Workspace',
  display: {
    label: 'List Workspaces',
    description: 'List workspaces available to the authenticated user.',
    hidden: true,
  },
  operation: {
    inputFields: [{ key: 'name', required: false, type: 'string', label: 'Name Filter' }],
    perform,
    sample: {
      id: 'workspace_123',
      name: 'Acme',
      slug: 'acme',
      role: 'owner',
      created_at: '2026-02-24T09:00:00.000Z',
    },
  },
};
