const { medalRequest } = require('../lib/api');

const UPDATE_FIELDS = [
  'email',
  'first_name',
  'last_name',
  'phone',
  'company',
  'job_title',
  'status',
  'email_status',
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
  const contactId = bundle.inputData.contact_id;
  const payload = buildPayload(bundle.inputData);

  if (Object.keys(payload).length === 0) {
    throw new z.errors.Error('Provide at least one field to update.', 'VALIDATION_ERROR', 400);
  }

  await medalRequest(z, bundle, {
    method: 'PATCH',
    path: `/api/v1/contacts/${encodeURIComponent(contactId)}`,
    body: payload,
  });

  const contactResponse = await medalRequest(z, bundle, {
    method: 'GET',
    path: `/api/v1/contacts/${encodeURIComponent(contactId)}`,
  });

  return contactResponse?.data || { id: contactId, ...payload };
};

module.exports = {
  key: 'update_contact',
  noun: 'Contact',
  display: {
    label: 'Update Contact',
    description: 'Update an existing CRM contact in Medal.',
  },
  operation: {
    inputFields: [
      { key: 'contact_id', label: 'Contact ID', required: true, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'string' },
      { key: 'first_name', label: 'First Name', required: false, type: 'string' },
      { key: 'last_name', label: 'Last Name', required: false, type: 'string' },
      { key: 'phone', label: 'Phone', required: false, type: 'string' },
      { key: 'company', label: 'Company', required: false, type: 'string' },
      { key: 'job_title', label: 'Job Title', required: false, type: 'string' },
      { key: 'status', label: 'Status', required: false, type: 'string' },
      { key: 'email_status', label: 'Email Status', required: false, type: 'string' },
    ],
    perform,
    sample: {
      id: 'jd7f8f3k4g9',
      email: 'person@example.com',
      first_name: 'Jordan',
      last_name: 'Lee',
      company: 'Acme Inc',
      status: 'customer',
      updated_at: '2026-02-24T10:15:00.000Z',
    },
  },
};
