const { medalRequest } = require('../lib/api');

const postLabel = (post) => {
  const title = String(post.title || '').trim();
  const status = String(post.status || '').trim();
  if (title && status) return `${title} (${status})`;
  if (title) return title;

  const content = String(post.content || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (content && status)
    return `${content.slice(0, 50)}${content.length > 50 ? '…' : ''} (${status})`;
  if (content) return `${content.slice(0, 50)}${content.length > 50 ? '…' : ''}`;

  return String(post.id || 'Unknown Post');
};

const perform = async (z, bundle) => {
  const status = String(bundle.inputData.status || '').trim();

  const response = await medalRequest(z, bundle, {
    method: 'GET',
    path: '/api/v1/posts',
    params: {
      limit: 50,
      status: status || undefined,
    },
  });

  const posts = Array.isArray(response?.data) ? response.data : [];

  return posts.map((post) => ({
    ...post,
    display_name: postLabel(post),
  }));
};

module.exports = {
  key: 'list_posts',
  noun: 'Post',
  display: {
    label: 'List Posts',
    description: 'List posts for dynamic dropdown fields.',
    hidden: true,
  },
  operation: {
    inputFields: [
      {
        key: 'status',
        required: false,
        type: 'string',
        label: 'Filter by Status',
        choices: {
          draft: 'Draft',
          scheduled: 'Scheduled',
          published: 'Published',
          failed: 'Failed',
        },
      },
    ],
    perform,
    sample: {
      id: 'post_123',
      display_name: 'Launch update (draft)',
      title: 'Launch update',
      status: 'draft',
      type: 'social',
    },
  },
};
