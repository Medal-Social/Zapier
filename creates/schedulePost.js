const { medalRequest } = require('../lib/api');

const perform = async (z, bundle) => {
  const postId = bundle.inputData.post_id;
  await medalRequest(z, bundle, {
    method: 'POST',
    path: `/api/v1/posts/${encodeURIComponent(postId)}/schedule`,
    body: {
      scheduled_at: bundle.inputData.scheduled_at,
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
      { key: 'post_id', label: 'Post ID', required: true, type: 'string' },
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
