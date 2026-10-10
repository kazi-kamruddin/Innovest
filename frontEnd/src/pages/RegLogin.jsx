
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import GoogleSignIn from '../components/GoogleSignIn';

const inputClass =
  "block! h-[46px]! w-full! rounded-lg! border! border-[#D4DFD5]! bg-white! px-4! text-[14px]! text-[#24352E]! outline-none! placeholder:text-[#A0ADA2]! transition-all! duration-200! focus:border-[#477957]! focus:ring-4! focus:ring-[#477957]/10!";

function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex! w-fit! items-center! gap-2.5! text-[#24352E]! no-underline!"
    >
      <span className="flex! h-9! w-9! items-center! justify-center! rounded-xl! bg-[#E8F2E9]! text-[#176D5D]!">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <path d="m3 17 6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </svg>
      </span>
      <span className="text-[20px]! font-semibold! tracking-[-0.04em]!">
        Innovest<span className="text-[#176D5D]!">.</span>
      </span>
    </Link>
  );
}

function LoginArtwork() {
  const path =
    "M-115 500 C45 460 75 310 213 363 S422 330 382 239 S475 145 625 180";

  return (
    <aside
      aria-hidden="true"
      className="relative! hidden! min-h-[550px]! overflow-hidden! bg-[#DDEBDD]! lg:block!"
    >
      <div className="absolute! inset-0!" style={{
        background: "radial-gradient(circle at 75% 30%, #F1F8ED, #DCEBDD 65%, #CDDFCD)"
      }} />

      <div className="absolute! left-8! top-8! z-10! flex! items-center! gap-2!">
        <span className="h-2! w-2! rounded-full! bg-[#35785A]!" />
        <span className="text-[10px]! font-semibold! tracking-[0.15em]! text-[#42694F]!">
          POSSIBILITIES IN MOTION
        </span>
      </div>

      <svg
        viewBox="0 0 520 550"
        preserveAspectRatio="xMidYMid slice"
        className="absolute! inset-0! h-full! w-full!"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="auth-road" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EFF7EB" />
            <stop offset="100%" stopColor="#B1CDB3" />
          </linearGradient>
          <radialGradient id="auth-ball" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EAF6E7" />
            <stop offset="100%" stopColor="#82A589" />
          </radialGradient>
          <filter id="auth-shadow">
            <feDropShadow dx="6" dy="14" stdDeviation="12" floodColor="#56785A" floodOpacity=".24" />
          </filter>
        </defs>

        <path d={path} transform="translate(0 14)"
          stroke="#8EAA93" strokeWidth="94"
          strokeLinecap="round" filter="url(#auth-shadow)" />
        <path d={path} stroke="url(#auth-road)"
          strokeWidth="92" strokeLinecap="round" />
        <path d={path} stroke="#B6D0B7"
          strokeWidth="68" strokeLinecap="round" />
        <path d={path} stroke="#DDEDD8"
          strokeWidth="55" strokeLinecap="round" />

        <circle cx="382" cy="242" r="25"
          fill="url(#auth-ball)" filter="url(#auth-shadow)" />
        <ellipse cx="374" cy="233" rx="8" ry="5"
          fill="#FFFFFF" opacity=".7" transform="rotate(-35 374 233)" />
      </svg>

      
    </aside>
  );
}

export default function RegLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { login, error, errorCode, isLoading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setSuccessMsg("");
    const success = await login(email, password);

    if (success) {
      setSuccessMsg("Login successful!");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/");
    }
  };

  return (
    <section
      className="auth-page-enter w-full! bg-[#F0F4EE]!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="mx-auto! flex! min-h-[calc(100svh-86px)]! w-full! max-w-[1440px]! items-center! justify-center! px-4! py-4! sm:px-6! lg:px-8!">
        <div className="grid! w-full! max-w-[980px]! grid-cols-1! overflow-hidden! rounded-[22px]! border! border-[#DAE4DA]! bg-white! shadow-[0_18px_55px_rgba(38,62,43,0.08)]! lg:grid-cols-2!">

          <div className="flex! min-h-[550px]! flex-col! bg-[#FEFFFC]! px-6! py-6! sm:px-9! lg:px-10! lg:py-7!">
            <Brand />

            <div className="mx-auto! flex! w-full! max-w-[355px]! flex-1! flex-col! justify-center! py-5!">
              <p className="mb-2! text-[10px]! font-semibold! tracking-[0.15em]! text-[#64816B]!">
                WELCOME TO INNOVEST
              </p>
              <h1 className="m-0! text-[35px]! font-semibold! leading-[1.15]! tracking-[-0.045em]! text-[#20392B]!">
                Welcome back.
              </h1>
              <p className="mb-0! mt-2! text-[13px]! text-[#758379]!">
                Enter your details to access your account.
              </p>

              <form onSubmit={handleSubmit} autoComplete="on"
                className="mt-7! flex! flex-col! gap-4!">
                <div>
                  <label htmlFor="login-email"
                    className="mb-1.5! block! text-[12px]! font-medium! text-[#334B3A]!">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="login-password"
                    className="mb-1.5! block! text-[12px]! font-medium! text-[#334B3A]!">
                    Password
                  </label>
                  <div className="relative!">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`${inputClass} pr-12!`}
                    />

                    <button type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute! right-2! top-1/2! flex! h-9! w-9! -translate-y-1/2! items-center! justify-center! rounded-lg! border-0! bg-transparent! text-[#819184]! hover:bg-[#EDF4ED]!"
                    >
                      {showPassword ? (
                        <svg width="19" height="19" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M3 3 21 21M10 5.2A11 11 0 0 1 12 5c6 0 10 7 10 7a16 16 0 0 1-3.4 4M6 6C3.3 8.2 2 12 2 12s4 7 10 7a10 10 0 0 0 4.2-.9M10 10a3 3 0 0 0 4 4" />
                        </svg>
                      ) : (
                        <svg width="19" height="19" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <Link to="/forgot-password"
                  className="self-end! text-[12px]! font-medium! text-[#345C3D]! no-underline! hover:underline!">
                  Forgot password?
                </Link>

                {error && (
                  <div role="alert"
                    className="rounded-lg! border! border-[#EBC9C4]! bg-[#FFF4F2]! px-3! py-2.5! text-[12px]! text-[#B34942]!">
                    {errorCode === "EMAIL_UNVERIFIED" || errorCode === "HTTP_429" || errorCode === "HTTP_503"
                      ? error
                      : "Invalid credentials. Please try again."}
                    {errorCode === "EMAIL_UNVERIFIED" && (
                      <Link to="/check-email" state={{ email }} className="ml-1! font-semibold! text-[#345C3D]!">Resend link</Link>
                    )}
                  </div>
                )}

                {successMsg && (
                  <div role="status"
                    className="rounded-lg! border! border-[#C6E3CB]! bg-[#F0F8F0]! px-3! py-2.5! text-[12px]! text-[#176D5D]!">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1! flex! min-h-[47px]! w-full! items-center! justify-center! gap-2! rounded-lg! border-0! bg-[#345C3D]! px-5! text-[14px]! font-semibold! text-white! transition-colors! hover:bg-[#254B33]! disabled:cursor-not-allowed! disabled:opacity-60!"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                  {!isLoading && <span aria-hidden="true">→</span>}
                </button>
              </form>

              <GoogleSignIn />

              <p className="mb-0! mt-5! text-center! text-[12px]! text-[#77857B]!">
                Don&apos;t have an account?{" "}
                <Link to="/signup"
                  className="font-semibold! text-[#345C3D]! no-underline! hover:underline!">
                  Sign up
                </Link>
              </p>
            </div>

            <p className="mb-0! text-[10px]! text-[#9AAA9C]!">
              INNOVEST · CONNECTING IDEAS AND OPPORTUNITY
            </p>
          </div>

          <LoginArtwork />
        </div>
      </div>
    </section>
  );
}
