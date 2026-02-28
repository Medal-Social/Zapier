const { medalRequest } = require('../lib/api');

const dealLabel = (deal) => {
  const title = String(deal.title || '').trim();
  const status = String(deal.status || '').trim();
  if (title && status) return `${title} (${status})`;
  if (title) return title;
  return String(deal.id || 'Unknown Deal');
};

const perform = async (z, bundle) => {
  const query = String(bundle.inputData.query || '').trim();

  const response = await medalRequest(z, bundle, {
    method: 'GET',
    path: '/api/v1/deals',
    params: {
      limit: 50,
      search: query || undefined,
    },
  });

  const deals = Array.isArray(response?.data) ? response.data : [];

  return deals.map((deal) => ({
    ...deal,
    display_name: dealLabel(deal),
  }));
};

module.exports = {
  key: 'list_deals',
  noun: 'Deal',
  display: {
    label: 'List Deals',
    description: 'List deals for dynamic dropdown fields.',
    hidden: true,
  },
  operation: {
    inputFields: [{ key: 'query', required: false, type: 'string', label: 'Search Deals' }],
    perform,
    sample: {
      id: 'deal_123',
      display_name: 'Acme Q2 campaign (draft)',
      title: 'Acme Q2 campaign',
      status: 'draft',
      currency: 'USD',
      value: 12_000,
    },
  },
};
