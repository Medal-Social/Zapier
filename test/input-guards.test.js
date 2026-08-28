const assert = require('node:assert/strict');
const addNote = require('../creates/addNote');
const createContact = require('../creates/createContact');
const createPost = require('../creates/createPost');
const schedulePost = require('../creates/schedulePost');
const updateContact = require('../creates/updateContact');
const updateDeal = require('../creates/updateDeal');

// `flags.cleanInputData` is false, so empty strings, nulls and empty arrays now
// reach perform instead of being stripped by the platform. Every required field
// consumed without going through a buildPayload filter has to reject them, or an
// empty id silently interpolates into a malformed URL such as
// `/api/v1/contacts//notes`.

const makeZ = (responder) => {
  const requests = [];
  return {
    requests,
    z: {
      request: async (request) => {
        requests.push(request);
        return responder ? responder(request) : { status: 200, data: { data: { id: 'id_1' } } };
      },
      errors: {
        Error: class ZapierError extends Error {
          constructor(message, code, status) {
            super(message);
            this.code = code;
            this.status = status;
          }
        },
      },
    },
  };
};

const bundleWith = (inputData) => ({
  inputData,
  authData: { access_token: 'token_123', workspace_id: 'workspace_abc' },
});

const blankCases = [
  {
    name: 'add_note contact id',
    action: addNote,
    inputData: { contact_id: '   ', content: 'A note.' },
    message: /Contact ID is required/,
  },
  {
    name: 'add_note content',
    action: addNote,
    inputData: { contact_id: 'contact_1', content: '' },
    message: /Note Content is required/,
  },
  {
    name: 'schedule_post post id',
    action: schedulePost,
    inputData: { post_id: '', scheduled_at: '2026-03-01T10:00:00.000Z' },
    message: /Post ID is required/,
  },
  {
    name: 'schedule_post scheduled at',
    action: schedulePost,
    inputData: { post_id: 'post_1', scheduled_at: '' },
    message: /Scheduled At is required/,
  },
  {
    name: 'update_contact contact id',
    action: updateContact,
    inputData: { contact_id: '  ', email: 'person@example.com' },
    message: /Contact ID is required/,
  },
  {
    name: 'update_deal deal id',
    action: updateDeal,
    inputData: { deal_id: null, title: 'Acme Q2' },
    message: /Deal ID is required/,
  },
  {
    name: 'create_contact email',
    action: createContact,
    inputData: { email: '   ' },
    message: /Email is required/,
  },
  {
    name: 'create_post content',
    action: createPost,
    inputData: { content: '', channel_ids: ['channel_a'] },
    message: /Content is required/,
  },
];

describe('required input guards', () => {
  for (const { name, action, inputData, message } of blankCases) {
    it(`rejects a blank ${name} without calling the API`, async () => {
      const { z, requests } = makeZ();

      await assert.rejects(() => action.operation.perform(z, bundleWith(inputData)), message);
      assert.equal(requests.length, 0, 'no request should be sent for invalid input');
    });
  }

  it('rejects an empty channel id list', async () => {
    const { z, requests } = makeZ();

    await assert.rejects(
      () => createPost.operation.perform(z, bundleWith({ content: 'Hello', channel_ids: [] })),
      /At least one channel ID is required/
    );
    assert.equal(requests.length, 0);
  });

  it('trims a padded id before putting it in the request path', async () => {
    const { z, requests } = makeZ();

    await addNote.operation.perform(
      z,
      bundleWith({ contact_id: '  contact_1  ', content: '  A note.  ' })
    );

    assert.equal(requests[0].url, 'https://io.medalsocial.com/api/v1/contacts/contact_1/notes');
    assert.equal(requests[0].body.content, 'A note.');
  });
});
