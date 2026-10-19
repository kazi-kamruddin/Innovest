export const EMPTY_PITCH = {
  title: "",
  company_location: "",
  country: "",
  cell_number: "",
  industry: "",
  stage: "",
  ideal_investor_role: "",
  total_raising_amount: "",
  minimum_investment: "",
  the_business: "",
  the_market: "",
  progress: "",
  objective: "",
};

export function normalizePitch(data) {
  return Object.fromEntries(
    Object.keys(EMPTY_PITCH).map((key) => [key, data?.[key] ?? ""])
  );
}

export function validatePitchFields(data) {
  const errors = {};
  if (!String(data.title ?? "").trim()) errors.title = "Please enter a pitch title.";
  if (!data.country) errors.country = "Please select a country.";
  if (!data.industry) errors.industry = "Please select an industry.";

  const total = data.total_raising_amount;
  const minimum = data.minimum_investment;
  for (const [key, value] of [["total_raising_amount", total], ["minimum_investment", minimum]]) {
    if (value !== "" && value !== null && value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      errors[key] = "Funding amounts must be valid non-negative numbers.";
    }
  }
  if (
    total !== "" && minimum !== "" &&
    total !== null && minimum !== null &&
    !errors.total_raising_amount && !errors.minimum_investment &&
    Number(minimum) > Number(total)
  ) {
    errors.minimum_investment = "Minimum investment cannot exceed the total raising amount.";
  }

  return errors;
}

export function validatePitch(data) {
  const errors = validatePitchFields(data);
  const firstError = Object.values(errors)[0];
  return firstError || null;
}

export const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Real Estate",
  "Education", "Food & Beverage", "Other",
];
export const STAGES = ["Idea", "Prototype", "Early Revenue", "Scaling", "Profitable"];
export const ROLES = ["Silent Investor", "Active Partner", "Advisor", "Board Member"];
export const COUNTRIES = [
  "Afghanistan", "Bangladesh", "Bhutan", "India",
  "Maldives", "Nepal", "Pakistan", "Sri Lanka",
];
