import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const inputClass = "block! h-[46px]! w-full! rounded-lg! border! border-[#D4DFD5]! bg-white! px-4! text-[14px]! text-[#24352E]! outline-none! placeholder:text-[#A0ADA2]! focus:border-[#477957]! focus:ring-4! focus:ring-[#477957]/10!";
const buttonClass = "mt-2! flex! min-h-[47px]! w-full! items-center! justify-center! rounded-lg! border-0! bg-[#345C3D]! px-5! text-[14px]! font-semibold! text-white! hover:bg-[#254B33]! disabled:opacity-60!";

async function postAccountAction(path, body) {
  const response = await fetch(`${API_BASE}/user/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Please try again later.");
  return data;
}

function AccountPage({ eyebrow, title, children }) {
  return (
    <section className="auth-page-enter min-h-[calc(100svh-86px)]! bg-[#F0F4EE]! px-4! py-12!" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="mx-auto! w-full! max-w-[440px]! rounded-[22px]! border! border-[#DAE4DA]! bg-[#FEFFFC]! px-6! py-8! shadow-[0_18px_55px_rgba(38,62,43,0.08)]! sm:px-9!">
        <Link to="/" className="text-[20px]! font-semibold! tracking-[-0.04em]! text-[#24352E]! no-underline!">Innovest<span className="text-[#176D5D]!">.</span></Link>
        <p className="mb-2! mt-8! text-[10px]! font-semibold! tracking-[0.15em]! text-[#64816B]!">{eyebrow}</p>
        <h1 className="m-0! text-[30px]! font-semibold! tracking-[-0.045em]! text-[#20392B]!">{title}</h1>
        <div className="mt-4! text-[13px]! leading-[1.6]! text-[#758379]!">{children}</div>
      </div>
    </section>
  );
}

function Status({ error, message }) {
  if (!error && !message) return null;
  return <p role={error ? "alert" : "status"} className={`rounded-lg! px-3! py-2.5! text-[12px]! ${error ? "bg-[#FFF4F2]! text-[#B34942]!" : "bg-[#F0F8F0]! text-[#176D5D]!"}`}>{error || message}</p>;
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await postAccountAction("forgot-password", { email });
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <AccountPage eyebrow="ACCOUNT RECOVERY" title="Reset your password.">
    <p>Enter your account email and we&apos;ll send a reset link if an account exists.</p>
    <form onSubmit={submit} className="mt-5! flex! flex-col! gap-3!">
      <label htmlFor="recover-email" className="font-medium! text-[#334B3A]!">Email address</label>
      <input id="recover-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
      <Status error={error} message={message} />
      <button disabled={loading} className={buttonClass}>{loading ? "Sending..." : "Send reset link"}</button>
    </form>
    <Link to="/login" className="mt-5! inline-block! font-semibold! text-[#345C3D]!">Back to sign in</Link>
  </AccountPage>;
}

export function CheckEmail() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await postAccountAction("resend-verification", { email });
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <AccountPage eyebrow="VERIFY YOUR ACCOUNT" title="Check your email.">
    <p>{location.state?.deliveryFailed
      ? "Your account was created, but we could not send the verification email. Try requesting a new link below."
      : "Open the verification link from your email. The link expires after 24 hours. If it does not arrive, request another below."}</p>
    <form onSubmit={submit} className="mt-5! flex! flex-col! gap-3!">
      <label htmlFor="verify-email-address" className="font-medium! text-[#334B3A]!">Need another link?</label>
      <input id="verify-email-address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
      <Status error={error} message={message} />
      <button disabled={loading} className={buttonClass}>{loading ? "Sending..." : "Resend verification link"}</button>
    </form>
    <Link to="/login" className="mt-5! inline-block! font-semibold! text-[#345C3D]!">Back to sign in</Link>
  </AccountPage>;
}

export function VerifyEmail() {
  const attempted = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(window.history.state, "", "/verify-email");
    if (!token) {
      setError("This verification link is missing its token.");
      return;
    }
    postAccountAction("verify-email", { token })
      .then((result) => setMessage(result.message))
      .catch((err) => setError(err.message));
  }, []);

  return <AccountPage eyebrow="VERIFY YOUR ACCOUNT" title="Email verification.">
    <Status error={error} message={message || (!error ? "Checking your link..." : "")} />
    <Link to="/login" className="mt-5! inline-block! font-semibold! text-[#345C3D]!">Go to sign in</Link>
  </AccountPage>;
}

export function ResetPassword() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token"));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.history.replaceState(window.history.state, "", "/reset-password");
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await postAccountAction("reset-password", { token, password });
      setMessage(result.message);
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <AccountPage eyebrow="ACCOUNT RECOVERY" title="Choose a new password.">
    {!token && <Status error="This reset link is missing its token." />}
    {token && !message && <form onSubmit={submit} className="mt-5! flex! flex-col! gap-3!">
      <label htmlFor="new-password" className="font-medium! text-[#334B3A]!">New password</label>
      <input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
      <label htmlFor="confirm-password" className="font-medium! text-[#334B3A]!">Confirm password</label>
      <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirm} onChange={(event) => setConfirm(event.target.value)} className={inputClass} />
      <Status error={error} />
      <button disabled={loading} className={buttonClass}>{loading ? "Updating..." : "Update password"}</button>
    </form>}
    <Status message={message} />
    <Link to="/login" className="mt-5! inline-block! font-semibold! text-[#345C3D]!">Back to sign in</Link>
  </AccountPage>;
}
