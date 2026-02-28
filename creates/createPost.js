const { medalRequest } = require('../lib/api');

const normalizeChannelIds = (input) => {
  if (Array.isArray(input)) {
    return input.map((value) => String(value).trim()).filter(Boolean);
  }

  if (typeof input === 'string') {
    return input
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
};

const perform = async (z, bundle) => {
  const channelIds = normalizeChannelIds(bundle.inputData.channel_ids);
  if (channelIds.length === 0) {
    throw new z.errors.Error('At least one channel ID is required.', 'VALIDATION_ERROR', 400);
  }

  const payload = {
    content: bundle.inputData.content,
    channel_ids: channelIds,
  };

  if (bundle.inputData.title) payload.title = bundle.inputData.title;
  if (bundle.inputData.type) payload.type = bundle.inputData.type;

  const createResponse = await medalRequest(z, bundle, {
    method: 'POST',
    path: '/api/v1/posts',
    body: payload,
  });

  const postId = createResponse?.data?.id;
  if (!postId) {
    throw new z.errors.Error('Failed to create post.', 'CREATE_FAILED', 500);
  }

  if (bundle.inputData.scheduled_at) {
    await medalRequest(z, bundle, {
      method: 'POST',
      path: `/api/v1/posts/${encodeURIComponent(postId)}/schedule`,
      body: {
        scheduled_at: bundle.inputData.scheduled_at,
      },
    });
  }

  const postResponse = await medalRequest(z, bundle, {
    method: 'GET',
    path: `/api/v1/posts/${encodeURIComponent(postId)}`,
  });

  return postResponse?.data || { id: postId, ...payload };
};

module.exports = {
  key: 'create_post',
  noun: 'Post',
  display: {
    label: 'Create Post',
    description:
      'Create a social post draft, with optional scheduling, across selected channel IDs.',
  },
  operation: {
    inputFields: [
      { key: 'title', label: 'Title', required: false, type: 'string' },
      {
        key: 'type',
        label: 'Post Type',
        required: false,
        type: 'string',
        choices: {
          social: 'Social',
          newsletter: 'Newsletter',
          blog: 'Blog',
        },
      },
      { key: 'content', label: 'Content', required: true, type: 'text' },
      {
        key: 'channel_ids',
        label: 'Channel IDs',
        required: true,
        list: true,
        type: 'string',
        helpText: 'One or more Medal channel IDs to publish this content to.',
      },
      {
        key: 'scheduled_at',
        label: 'Schedule At',
        required: false,
        type: 'datetime',
        helpText: 'Optional. If set, the post is scheduled after creation.',
      },
    ],
    perform,
    sample: {
      id: 'post_123',
      type: 'social',
      content: 'Launching our new feature today.',
      status: 'scheduled',
      channel_ids: ['channel_a', 'channel_b'],
      scheduled_at: '2026-02-24T14:00:00.000Z',
    },
  },
};
