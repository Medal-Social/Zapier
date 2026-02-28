const DEFAULT_API_BASE_URL = 'https://io.medalsocial.com';
const DEFAULT_AUTH_BASE_URL = 'https://app.medalsocial.com';
const DEFAULT_TOKEN_BASE_URL = DEFAULT_AUTH_BASE_URL;

const OAUTH_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'workspace:read',
  'contacts:read',
  'contacts:write',
  'deals:read',
  'deals:write',
  'posts:read',
  'posts:write',
  'channels:read',
].join(' ');

module.exports = {
  DEFAULT_API_BASE_URL,
  DEFAULT_AUTH_BASE_URL,
  DEFAULT_TOKEN_BASE_URL,
  OAUTH_SCOPES,
};
