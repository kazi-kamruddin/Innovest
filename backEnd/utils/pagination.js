const MAX_OFFSET = 1000000;

function parseStrictNonNegativeInt(value) {
  if (typeof value !== "string" && typeof value !== "number") return NaN;
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) return NaN;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : NaN;
}

function parsePagination(query = {}, { defaultLimit = 50, maxLimit = 100 } = {}) {
  const parsedLimit = parseStrictNonNegativeInt(query?.limit);
  const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, maxLimit)
    : defaultLimit;

  const parsedPage = parseStrictNonNegativeInt(query?.page);
  const maxPage = Math.floor(MAX_OFFSET / limit) + 1;
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0
    ? Math.min(parsedPage, maxPage)
    : 1;

  const parsedOffset = parseStrictNonNegativeInt(query?.offset);
  const computedOffset = (page - 1) * limit;
  const offset = Number.isSafeInteger(parsedOffset) && parsedOffset >= 0
    ? Math.min(parsedOffset, MAX_OFFSET)
    : Math.min(computedOffset, MAX_OFFSET);

  if (!Number.isSafeInteger(limit) || !Number.isSafeInteger(offset) || limit < 1 || offset < 0) {
    throw new Error("Pagination parameters must resolve to safe non-negative integers");
  }

  return { page, limit, offset };
}

module.exports = {
  MAX_OFFSET,
  parsePagination,
};
