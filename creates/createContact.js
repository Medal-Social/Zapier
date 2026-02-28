const { medalRequest } = require('../lib/api');

const CONTACT_OPTIONAL_FIELDS = [
  'first_name',
  'last_name',
  'phone',
  'company',
  'job_title',
  'status',
  'email_status',
];

const buildPayload = (inputData) => {
  const payload = { email: inputData.email };
  for (const key of CONTACT_OPTIONAL_FIELDS) {
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
    path: '/api/v1/contacts',
    body: payload,
  });

  const contactId = createResponse?.data?.id;
  if (!contactId) {
    return { id: null, ...payload };
  }

  const contactResponse = await medalRequest(z, bundle, {
    method: 'GET',
    path: `/api/v1/contacts/${encodeURIComponent(contactId)}`,
  });

  return contactResponse?.data || { id: contactId, ...payload };
};

module.exports = {
  key: 'create_contact',
  noun: 'Contact',
  display: {
    label: 'Create Contact',
    description: 'Create a CRM contact in Medal.',
  },
  operation: {
    inputFields: [
      { key: 'email', label: 'Email', required: true, type: 'string' },
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
      status: 'lead',
      created_at: '2026-02-24T10:00:00.000Z',
    },
  },
};
