const search = require('../searches/listContacts');

module.exports = {
  key: search.key,
  noun: search.noun,
  display: {
    label: 'List Contacts (Dropdown)',
    description: search.display.description,
    hidden: true,
  },
  operation: search.operation,
};
