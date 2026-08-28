const assert = require('node:assert/strict');
const addNote = require('../creates/addNote');
const createContact = require('../creates/createContact');
const createDeal = require('../creates/createDeal');
const createPost = require('../creates/createPost');
const schedulePost = require('../creates/schedulePost');
const updateContact = require('../creates/updateContact');
const updateDeal = require('../creates/updateDeal');
const findContact = require('../searches/findContact');
const findDeal = require('../searches/findDeal');
const workspace = require('../searches/workspace');

// `flags.cleanInputData` is false, so every value the platform used to strip —
// empty strings, nulls, empty arrays AND empty objects — now reaches perform.
// Required fields consumed without a buildPayload filter have to reject them, or
// an empty id silently interpolates into a malformed URL such as
// `/api/v1/contacts//notes`. Arrays are the awkward case: `[]` is truthy, so a
// truthiness guard lets it through and `encodeURIComponent([])` is ''.

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
  {
    name: 'create_deal title',
    action: createDeal,
    inputData: { title: '   ' },
    message: /Title is required/,
  },
  // `[]` survives cleanInputData: false, is truthy, and encodes to an empty
  // string, so it has to be rejected explicitly at every required field.
  {
    name: 'add_note contact id given as an empty array',
    action: addNote,
    inputData: { contact_id: [], content: 'A note.' },
    message: /Contact ID is required/,
  },
  {
    name: 'update_deal deal id given as an empty array',
    action: updateDeal,
    inputData: { deal_id: [], title: 'Acme Q2' },
    message: /Deal ID is required/,
  },
  {
    name: 'create_deal title given as an empty object',
    action: createDeal,
    inputData: { title: {} },
    message: /Title is required/,
  },
  {
    name: 'schedule_post post id given as a populated array',
    action: schedulePost,
    inputData: { post_id: ['post_1', 'post_2'], scheduled_at: '2026-03-01T10:00:00.000Z' },
    message: /Post ID must be a single value/,
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

  it('trims a padded id but sends user content exactly as written', async () => {
    const { z, requests } = makeZ();
    const content = '  Line one.\n\n  Indented line two.\n';

    await addNote.operation.perform(z, bundleWith({ contact_id: '  contact_1  ', content }));

    assert.equal(requests[0].url, 'https://io.medalsocial.com/api/v1/contacts/contact_1/notes');
    assert.equal(requests[0].body.content, content, 'note content must not be reformatted');
  });
});

describe('values the platform used to strip', () => {
  it('drops optional fields sent as empty arrays or objects', async () => {
    const { z, requests } = makeZ();

    await createContact.operation.perform(
      z,
      bundleWith({ email: 'person@example.com', phone: [], company: {}, first_name: 'Jordan' })
    );

    assert.deepEqual(requests[0].body, { email: 'person@example.com', first_name: 'Jordan' });
  });

  it('does not schedule a post when scheduled_at is an empty array', async () => {
    const { z, requests } = makeZ();

    await createPost.operation.perform(
      z,
      bundleWith({ content: 'Hello', channel_ids: ['channel_a'], scheduled_at: [], title: [] })
    );

    const scheduled = requests.filter((request) => request.url.endsWith('/schedule'));
    assert.equal(scheduled.length, 0, 'an empty array must not trigger scheduling');
    assert.equal('title' in requests[0].body, false, 'an empty array is not a title');
  });

  // createPost's optional fields were guarded by truthiness, which skipped false
  // and 0; the payload builders used `!== ''`, which kept them. Each has to keep
  // its own behaviour — scheduling on a non-datetime fires a second request that
  // fails only after the post exists, while a deal worth 0 is a real value.
  for (const scheduledAt of [false, 0]) {
    it(`does not schedule a post when scheduled_at is ${JSON.stringify(scheduledAt)}`, async () => {
      const { z, requests } = makeZ();

      await createPost.operation.perform(
        z,
        bundleWith({ content: 'Hello', channel_ids: ['channel_a'], scheduled_at: scheduledAt })
      );

      assert.equal(requests.filter((request) => request.url.endsWith('/schedule')).length, 0);
    });
  }

  it('keeps a zero deal value in the payload', async () => {
    const { z, requests } = makeZ();

    await createDeal.operation.perform(z, bundleWith({ title: 'Acme Q2', value: 0 }));

    assert.equal(requests[0].body.value, 0);
  });

  const arrayInputSearches = [
    { name: 'find_contact', action: findContact, inputData: { email: [] } },
    { name: 'find_deal', action: findDeal, inputData: { title: [] } },
  ];

  for (const { name, action, inputData } of arrayInputSearches) {
    it(`fails ${name} with a validation error, not a TypeError, on an array input`, async () => {
      const { z } = makeZ();

      await assert.rejects(
        () => action.operation.perform(z, bundleWith(inputData)),
        (error) => {
          assert.equal(error instanceof TypeError, false, error.message);
          assert.equal(error.code, 'VALIDATION_ERROR');
          return true;
        }
      );
    });
  }

  it('filters workspaces without crashing on an array name', async () => {
    const { z } = makeZ(async () => ({
      status: 200,
      data: { data: [{ id: 'w1', name: 'Acme', slug: 'acme' }] },
    }));

    const result = await workspace.operation.perform(z, bundleWith({ name: [] }));
    assert.deepEqual(
      result.map((entry) => entry.id),
      ['w1']
    );
  });
});
