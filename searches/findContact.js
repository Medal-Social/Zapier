const { medalRequest } = require('../lib/api');

const perform = async (z, bundle) => {
  const email = (bundle.inputData.email || '').trim();
  if (!email) {
    throw new z.errors.Error('Email is required.', 'VALIDATION_ERROR', 400);
  }

  const response = await medalRequest(z, bundle, {
    method: 'GET',
    path: '/api/v1/contacts',
    params: {
      search: email,
      limit: 20,
    },
  });

  const contacts = Array.isArray(response?.data) ? response.data : [];
  const normalizedEmail = email.toLowerCase();
  const exact = contacts.find(
    (contact) => String(contact.email || '').toLowerCase() === normalizedEmail
  );

  if (exact) return [exact];
  return contacts.slice(0, 1);
};

module.exports = {
  key: 'find_contact',
  noun: 'Contact',
  display: {
    label: 'Find Contact',
    description: 'Find a contact by email address.',
  },
  operation: {
    inputFields: [{ key: 'email', label: 'Email', required: true, type: 'string' }],
    perform,
    sample: {
      id: 'contact_123',
      email: 'person@example.com',
      first_name: 'Jordan',
      last_name: 'Lee',
    },
  },
};
