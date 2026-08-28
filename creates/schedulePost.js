const { medalRequest } = require('../lib/api');
const { requiredTrimmedInput } = require('../lib/inputs');

const perform = async (z, bundle) => {
  const postId = requiredTrimmedInput(z, bundle, 'post_id', 'Post ID');
  const scheduledAt = requiredTrimmedInput(z, bundle, 'scheduled_at', 'Scheduled At');
  await medalRequest(z, bundle, {
    method: 'POST',
    path: `/api/v1/posts/${encodeURIComponent(postId)}/schedule`,
    body: {
      scheduled_at: scheduledAt,
    },
  });

  const postResponse = await medalRequest(z, bundle, {
    method: 'GET',
    path: `/api/v1/posts/${encodeURIComponent(postId)}`,
  });

  return postResponse?.data || { id: postId };
};

module.exports = {
  key: 'schedule_post',
  noun: 'Post',
  display: {
    label: 'Schedule Post',
    description: 'Schedule an existing Medal post for a future time.',
  },
  operation: {
    inputFields: [
      {
        key: 'post_id',
        label: 'Post ID',
        required: true,
        type: 'string',
        dynamic: 'list_posts.id.display_name',
      },
      { key: 'scheduled_at', label: 'Scheduled At', required: true, type: 'datetime' },
    ],
    perform,
    sample: {
      id: 'post_123',
      status: 'scheduled',
      scheduled_at: '2026-02-24T14:00:00.000Z',
    },
  },
};
