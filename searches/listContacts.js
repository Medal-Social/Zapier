const { medalRequest } = require('../lib/api');

const contactLabel = (contact) => {
  const firstName = String(contact.first_name || '').trim();
  const lastName = String(contact.last_name || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName && contact.email) return `${fullName} <${contact.email}>`;
  if (contact.email) return String(contact.email);
  if (fullName) return fullName;
  return String(contact.id || 'Unknown Contact');
};

const perform = async (z, bundle) => {
  const query = String(bundle.inputData.query || '').trim();

  const response = await medalRequest(z, bundle, {
    method: 'GET',
    path: '/api/v1/contacts',
    params: {
      limit: 50,
      search: query || undefined,
    },
  });

  const contacts = Array.isArray(response?.data) ? response.data : [];

  return contacts.map((contact) => ({
    ...contact,
    display_name: contactLabel(contact),
  }));
};

module.exports = {
  key: 'list_contacts',
  noun: 'Contact',
  display: {
    label: 'List Contacts',
    description: 'List contacts for dynamic dropdown fields.',
    hidden: true,
  },
  operation: {
    inputFields: [{ key: 'query', required: false, type: 'string', label: 'Search Contacts' }],
    perform,
    sample: {
      id: 'contact_123',
      display_name: 'Jordan Lee <person@example.com>',
      email: 'person@example.com',
      first_name: 'Jordan',
      last_name: 'Lee',
    },
  },
};
