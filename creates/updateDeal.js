const { medalRequest } = require('../lib/api');

const UPDATE_FIELDS = [
  'title',
  'description',
  'value',
  'currency',
  'status',
  'brand_name',
  'brand_website',
  'contact_name',
  'contact_email',
  'start_date',
  'end_date',
  'notes',
];

const buildPayload = (inputData) => {
  const payload = {};
  for (const key of UPDATE_FIELDS) {
    if (inputData[key] !== undefined && inputData[key] !== null && inputData[key] !== '') {
      payload[key] = inputData[key];
    }
  }
  return payload;
};

const perform = async (z, bundle) => {
  const dealId = bundle.inputData.deal_id;
  const payload = buildPayload(bundle.inputData);

  if (Object.keys(payload).length === 0) {
    throw new z.errors.Error('Provide at least one field to update.', 'VALIDATION_ERROR', 400);
  }

  await medalRequest(z, bundle, {
    method: 'PATCH',
    path: `/api/v1/deals/${encodeURIComponent(dealId)}`,
    body: payload,
  });

  const dealResponse = await medalRequest(z, bundle, {
    method: 'GET',
    path: `/api/v1/deals/${encodeURIComponent(dealId)}`,
  });

  return dealResponse?.data || { id: dealId, ...payload };
};

module.exports = {
  key: 'update_deal',
  noun: 'Deal',
  display: {
    label: 'Update Deal',
    description: 'Update an existing deal in Medal.',
  },
  operation: {
    inputFields: [
      { key: 'deal_id', label: 'Deal ID', required: true, type: 'string' },
      { key: 'title', label: 'Title', required: false, type: 'string' },
      { key: 'description', label: 'Description', required: false, type: 'text' },
      { key: 'value', label: 'Value', required: false, type: 'number' },
      { key: 'currency', label: 'Currency', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'string' },
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
      status: 'active',
      value: 15_000,
      updated_at: '2026-02-24T11:00:00.000Z',
    },
  },
};
