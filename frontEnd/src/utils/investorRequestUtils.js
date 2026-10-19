export const REQUEST_CATEGORIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Education",
  "Food & Beverage",
  "Other",
];

export const EMPTY_INVESTOR_REQUEST = {
  title: "",
  description: "",
  category: "",
  minInvestment: "",
  maxInvestment: "",
};

export function normalizeInvestorRequest(data) {
  return Object.fromEntries(
    Object.keys(EMPTY_INVESTOR_REQUEST).map((key) => [key, data?.[key] ?? ""])
  );
}

export function validateInvestorRequestFields(formData) {
  const errors = {};
  if (!formData.title?.trim()) errors.title = "Please add a request title.";
  if (!formData.description?.trim()) errors.description = "Please describe the opportunity you're looking for.";
  if (!formData.category) errors.category = "Please choose an investment category.";

  const { minInvestment: min, maxInvestment: max } = formData;
  if (min !== "" && min !== null && min !== undefined && (!Number.isFinite(Number(min)) || Number(min) < 0)) {
    errors.minInvestment = "Minimum investment must be a valid non-negative amount.";
  }
  if (max !== "" && max !== null && max !== undefined && (!Number.isFinite(Number(max)) || Number(max) < 0)) {
    errors.maxInvestment = "Maximum investment must be a valid non-negative amount.";
  }
  if (
    min !== "" && max !== "" && min !== null && max !== null &&
    !errors.minInvestment && !errors.maxInvestment &&
    Number(min) > Number(max)
  ) {
    errors.minInvestment = "Minimum investment cannot exceed maximum investment.";
  }
  return errors;
}

export function validateInvestorRequest(formData) {
  const errors = validateInvestorRequestFields(formData);
  const firstError = Object.values(errors)[0];
  return firstError || null;
}

export function getInvestorRequestPayload(formData) {
  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    category: formData.category,
    minInvestment: formData.minInvestment === "" ? null : Number(formData.minInvestment),
    maxInvestment: formData.maxInvestment === "" ? null : Number(formData.maxInvestment),
  };
}

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function moneyText(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const amount = Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(amount) ? `$${numberFormat.format(amount)}` : String(value);
}

export function investmentRange(request) {
  const min = moneyText(request?.minInvestment);
  const max = moneyText(request?.maxInvestment);
  if (min && max) return `${min} – ${max}`;
  if (min) return `From ${min}`;
  if (max) return `Up to ${max}`;
  return "Flexible budget";
}

export function readableDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
