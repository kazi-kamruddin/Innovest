const emailEnabled = () => process.env.ACCOUNT_EMAIL_ENABLED === "true";
const emailReady = () => emailEnabled() && Boolean(
  process.env.BREVO_API_KEY &&
  process.env.AUTH_EMAIL_FROM &&
  process.env.FRONTEND_URL
);

const sendAccountEmail = async ({ to, subject, path, token }) => {
  if (!emailReady()) throw new Error("Account email is not configured");

  const link = new URL(path, process.env.FRONTEND_URL);
  link.hash = new URLSearchParams({ token }).toString();

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Innovest", email: process.env.AUTH_EMAIL_FROM },
      to: [{ email: to }],
      subject,
      textContent: `Open this link to continue with your Innovest account:\n\n${link.toString()}\n\nIf you did not request this, you can ignore this email.`,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Account email provider returned ${response.status}`);
};

module.exports = { emailEnabled, emailReady, sendAccountEmail };
