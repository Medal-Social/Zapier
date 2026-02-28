const { medalRequest } = require('../lib/api');

const DEAL_OPTIONAL_FIELDS = [
  'description',
  'value',
  'currency',
  'brand_name',
  'brand_website',
  'contact_name',
  'contact_email',
  'start_date',
  'end_date',
  'notes',
];

const buildPayload = (inputData) => {
  const payload = {
    title: inputData.title,
  };

  for (const key of DEAL_OPTIONAL_FIELDS) {
    if (inputData[key] !== undefined && inputData[key] !== null && inputData[key] !== '') {
      payload[key] = inputData[key];
    }
  }

  return payload;
};

const perform = async (z, bundle) => {
  const payload = buildPayload(bundle.inputData);
  const createResponse = await medalRequest(z, bundle, {
    method: 'POST',
    path: '/api/v1/deals',
    body: payload,
  });

  const dealId = createResponse?.data?.id;
  if (!dealId) {
    return { id: null, ...payload };
  }

  const dealResponse = await medalRequest(z, bundle, {
    method: 'GET',
    path: `/api/v1/deals/${encodeURIComponent(dealId)}`,
  });

  return dealResponse?.data || { id: dealId, ...payload };
};

module.exports = {
  key: 'create_deal',
  noun: 'Deal',
  display: {
    label: 'Create Deal',
    description: 'Create a new deal in the Medal pipeline.',
  },
  operation: {
    inputFields: [
      { key: 'title', label: 'Title', required: true, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'text' },
      { key: 'value', label: 'Value', required: false, type: 'number' },
      { key: 'currency', label: 'Currency', required: false, type: 'string' },
      { key: 'brand_name', label: 'Brand Name', required: false, type: 'string' },
      { key: 'brand_website', label: 'Brand Website', required: false, type: 'string' },
      { key: 'contact_name', label: 'Contact Name', required: false, type: 'string' },
      { key: 'contact_email', label: 'Contact Email', required: false, type: 'string' },
      { key: 'start_date', label: 'Start Date', required: false, type: 'string' },
      { key: 'end_date', label: 'End Date', required: false, type: 'string' },
      { key: 'notes', label: 'Notes', required: false, type: 'text' },
    ],
    perform,
    sample: {
      id: 'deal_123',
      title: 'Acme Q2 campaign',
      status: 'draft',
      value: 12_000,
      currency: 'USD',
      brand_name: 'Acme Inc',
      contact_email: 'owner@acme.com',
    },
  },
};
