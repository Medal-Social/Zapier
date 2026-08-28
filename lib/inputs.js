// The app sets `flags.cleanInputData` to false, so empty strings, nulls and empty
// arrays reach perform instead of being stripped by the platform. Required fields
// that are interpolated into a request path or sent verbatim in a body are guarded
// here rather than in each action, so a blank value fails with a clear validation
// error instead of a malformed URL like `/api/v1/contacts//notes`.
const requiredInput = (z, bundle, key, label) => {
  const raw = bundle.inputData ? bundle.inputData[key] : undefined;
  const value = typeof raw === 'string' ? raw.trim() : raw;

  if (value === undefined || value === null || value === '') {
    throw new z.errors.Error(`${label} is required.`, 'VALIDATION_ERROR', 400);
  }

  return value;
};

module.exports = {
  requiredInput,
};
