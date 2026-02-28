const { medalRequest } = require('../lib/api');

const channelLabel = (channel) => {
  const name = String(channel.name || '').trim();
  const type = String(channel.type || '').trim();
  if (name && type) return `${name} (${type})`;
  if (name) return name;
  return String(channel.id || 'Unknown Channel');
};

const perform = async (z, bundle) => {
  const response = await medalRequest(z, bundle, {
    method: 'GET',
    path: '/api/v1/posts/channels',
  });

  const channels = Array.isArray(response?.data) ? response.data : [];

  return channels.map((channel) => ({
    ...channel,
    display_name: channelLabel(channel),
  }));
};

module.exports = {
  key: 'list_channels',
  noun: 'Channel',
  display: {
    label: 'List Channels',
    description: 'List publishing channels for dynamic dropdown fields.',
    hidden: true,
  },
  operation: {
    perform,
    sample: {
      id: 'channel_123',
      display_name: 'Brand X (instagram)',
      name: 'Brand X',
      type: 'instagram',
    },
  },
};
