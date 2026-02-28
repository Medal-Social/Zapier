const { medalRequest } = require('../lib/api');

const perform = async (z, bundle) => {
  const title = (bundle.inputData.title || '').trim();
  if (!title) {
    throw new z.errors.Error('Title is required.', 'VALIDATION_ERROR', 400);
  }

  const response = await medalRequest(z, bundle, {
    method: 'GET',
    path: '/api/v1/deals',
    params: {
      search: title,
      limit: 20,
    },
  });

  const deals = Array.isArray(response?.data) ? response.data : [];
  const normalizedTitle = title.toLowerCase();
  const exact = deals.find((deal) => String(deal.title || '').toLowerCase() === normalizedTitle);

  if (exact) return [exact];
  return deals.slice(0, 1);
};

module.exports = {
  key: 'find_deal',
  noun: 'Deal',
  display: {
    label: 'Find Deal',
    description: 'Find a deal by title.',
  },
  operation: {
    inputFields: [{ key: 'title', label: 'Title', required: true, type: 'string' }],
    perform,
    sample: {
      id: 'deal_123',
      title: 'Acme Q2 campaign',
      status: 'draft',
      value: 12_000,
      currency: 'USD',
    },
  },
};
