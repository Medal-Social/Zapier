const search = require('../searches/listChannels');

module.exports = {
  key: search.key,
  noun: search.noun,
  display: {
    label: 'List Channels (Dropdown)',
    description: search.display.description,
    hidden: true,
  },
  operation: search.operation,
};
