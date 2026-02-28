const search = require('../searches/listDeals');

module.exports = {
  key: search.key,
  noun: search.noun,
  display: {
    label: 'List Deals (Dropdown)',
    description: search.display.description,
    hidden: true,
  },
  operation: search.operation,
};
