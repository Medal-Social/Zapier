const authentication = require('./authentication');
const addNote = require('./creates/addNote');
const createContact = require('./creates/createContact');
const createDeal = require('./creates/createDeal');
const createPost = require('./creates/createPost');
const schedulePost = require('./creates/schedulePost');
const updateContact = require('./creates/updateContact');
const updateDeal = require('./creates/updateDeal');
const findContact = require('./searches/findContact');
const findDeal = require('./searches/findDeal');
const workspace = require('./searches/workspace');
const listChannels = require('./triggers/listChannels');
const listContacts = require('./triggers/listContacts');
const listDeals = require('./triggers/listDeals');
const listPosts = require('./triggers/listPosts');
const { addDefaultHeaders, handleApiErrors } = require('./lib/api');

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,
  beforeRequest: [addDefaultHeaders],
  afterResponse: [handleApiErrors],
  creates: {
    [createContact.key]: createContact,
    [updateContact.key]: updateContact,
    [addNote.key]: addNote,
    [createDeal.key]: createDeal,
    [updateDeal.key]: updateDeal,
    [createPost.key]: createPost,
    [schedulePost.key]: schedulePost,
  },
  searches: {
    [workspace.key]: workspace,
    [findContact.key]: findContact,
    [findDeal.key]: findDeal,
  },
  triggers: {
    [listChannels.key]: listChannels,
    [listContacts.key]: listContacts,
    [listDeals.key]: listDeals,
    [listPosts.key]: listPosts,
  },
};

module.exports = App;
