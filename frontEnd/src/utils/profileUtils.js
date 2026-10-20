export const PROFILE_API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function csvItems(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : String(value).split(",");
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
}

export function initialsOf(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
  return words.length ? words.slice(0, 2).map((word) => word[0].toUpperCase()).join("") : "IN";
}

export function moneyText(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "Not specified";
  const number = Number(value);
  return Number.isFinite(number)
    ? `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(number)}`
    : String(value);
}
