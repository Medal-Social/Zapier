// The app sets `flags.cleanInputData` to false, so every value the platform used
// to prune now reaches perform: empty strings, nulls, empty arrays and empty
// objects. Arrays are the trap — `[]` is truthy, so a plain truthiness check lets
// it through and `encodeURIComponent([])` is '', which rebuilds the malformed
// `/api/v1/contacts//notes` path this module exists to prevent.

// Mirrors exactly what the platform used to strip, so optional fields keep the
// behaviour they had before the flag was flipped. Deliberately does NOT treat a
// whitespace-only string as empty: those were always passed through.
const isEmptyValue = (value) => {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  return typeof value === 'object' && Object.keys(value).length === 0;
};

// A required field, validated but returned untouched, so user-authored text keeps
// its own leading and trailing whitespace.
const requiredInput = (z, bundle, key, label) => {
  const value = bundle.inputData ? bundle.inputData[key] : undefined;

  if (isEmptyValue(value) || (typeof value === 'string' && value.trim() === '')) {
    throw new z.errors.Error(`${label} is required.`, 'VALIDATION_ERROR', 400);
  }

  // A populated array or object reaching a scalar field means the Zap mapped a
  // line item into it; coercing would send `a,b` as if it were one id.
  if (typeof value === 'object') {
    throw new z.errors.Error(`${label} must be a single value.`, 'VALIDATION_ERROR', 400);
  }

  return value;
};

// A required identifier, timestamp or email, where surrounding whitespace is only
// ever a paste artefact and is safe to drop.
const requiredTrimmedInput = (z, bundle, key, label) =>
  String(requiredInput(z, bundle, key, label)).trim();

// An optional free-text value coerced to a searchable string. Guards the `.trim()`
// callers, which throw a TypeError when handed an array.
const optionalText = (value) => (isEmptyValue(value) ? '' : String(value).trim());

module.exports = {
  isEmptyValue,
  optionalText,
  requiredInput,
  requiredTrimmedInput,
};
