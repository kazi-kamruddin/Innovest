const MAX_MESSAGE_LENGTH = 4000;

function messageContentError(content) {
  if (typeof content !== 'string' || !content.trim()) return 'Message content is required';
  if (content.length > MAX_MESSAGE_LENGTH) return `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`;
  return null;
}

module.exports = { MAX_MESSAGE_LENGTH, messageContentError };
