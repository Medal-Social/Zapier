const { medalRequest } = require('../lib/api');

const perform = async (z, bundle) => {
  const contactId = bundle.inputData.contact_id;
  const response = await medalRequest(z, bundle, {
    method: 'POST',
    path: `/api/v1/contacts/${encodeURIComponent(contactId)}/notes`,
    body: {
      content: bundle.inputData.content,
    },
  });

  return {
    id: response?.data ? response.data.id : null,
    contact_id: contactId,
    content: bundle.inputData.content,
  };
};

module.exports = {
  key: 'add_note',
  noun: 'Note',
  display: {
    label: 'Add Contact Note',
    description: 'Add a note to an existing CRM contact.',
  },
  operation: {
    inputFields: [
      { key: 'contact_id', label: 'Contact ID', required: true, type: 'string' },
      { key: 'content', label: 'Note Content', required: true, type: 'text' },
    ],
    perform,
    sample: {
      id: 'hjk8384',
      contact_id: 'jd7f8f3k4g9',
      content: 'Followed up via email and booked a demo.',
    },
  },
};
