const textFieldsError = (body, fields, required = []) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Form fields must be a JSON object';
  for (const [field, limit] of Object.entries(fields)) {
    const value = body?.[field];
    if (value == null) {
      if (required.includes(field)) return `${field} is required`;
      continue;
    }
    if (typeof value !== 'string') return `${field} must be text`;
    if (required.includes(field) && !value.trim()) return `${field} is required`;
    // MySQL TEXT is limited in bytes, while VARCHAR is limited in characters.
    if (limit === 'text' ? Buffer.byteLength(value, 'utf8') > 65535 : [...value].length > limit) {
      return `${field} is too long`;
    }
  }
  return null;
};

module.exports = { textFieldsError };
