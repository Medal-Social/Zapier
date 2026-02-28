const search = require('../searches/listPosts');

module.exports = {
  key: search.key,
  noun: search.noun,
  display: {
    label: 'List Posts (Dropdown)',
    description: search.display.description,
    hidden: true,
  },
  operation: search.operation,
};
