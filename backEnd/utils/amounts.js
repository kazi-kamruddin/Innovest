const parseOptionalAmount = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return NaN;
  if (typeof value === "string" && !value.trim()) return NaN;

  const amount = Number(value);
  // All funding columns use DECIMAL(15,2); reject overflow before MySQL does.
  return Number.isFinite(amount) && amount >= 0 && amount <= 9999999999999.99 ? amount : NaN;
};

const parseAmountRange = (minimum, maximum) => {
  const min = parseOptionalAmount(minimum);
  const max = parseOptionalAmount(maximum);

  if (Number.isNaN(min) || Number.isNaN(max) || (min !== null && max !== null && min > max)) {
    return null;
  }

  return { min, max };
};

module.exports = { parseAmountRange };
