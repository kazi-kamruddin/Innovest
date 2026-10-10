
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignup } from "../hooks/useSignUp";
import GoogleSignIn from '../components/GoogleSignIn';

const inputClass =
  "block! h-[46px]! w-full! rounded-lg! border! border-[#D4DFD5]! bg-white! px-4! text-[14px]! text-[#24352E]! outline-none! placeholder:text-[#A0ADA2]! transition-all! duration-200! focus:border-[#477957]! focus:ring-4! focus:ring-[#477957]/10!";

function SignupArtwork() {
  return (
    <aside
      aria-hidden="true"
      className="relative! hidden! min-h-[590px]! flex-col! items-center! justify-center! gap-8! overflow-hidden! bg-[#153F30]! px-9! py-8! lg:order-1! lg:flex!"
      style={{
        background:
          "radial-gradient(ellipse at 85% 12%, #28624D, #194635 40%, #10382B)",
      }}
    >
      <div className="pointer-events-none! absolute! -right-36! -top-40! h-[420px]! w-[420px]! rounded-full! border! border-white/10!" />
      <div className="pointer-events-none! absolute! -bottom-40! -left-32! h-[360px]! w-[360px]! rounded-full! border! border-white/10!" />

      <div className="relative! z-10! flex! items-center! justify-between! gap-3!">
        <span className="text-[10px]! font-semibold! tracking-[0.15em]! text-[#B9D8C3]!">
          THE INNOVEST EXPERIENCE
        </span>
        
      </div>

      {/* Compact product preview */}
      

      <div className="relative! z-10! mx-auto! w-full! max-w-[405px]! text-center!">
        <h2 className="mt-0! text-[26px]! font-semibold! tracking-[-0.04em]! text-white!">
          Where ideas find opportunity.
        </h2>
        <p className="mx-auto! mb-0! mt-2! max-w-[340px]! text-[12px]! leading-[1.7]! text-[#B6D0BF]!">
          Connect with founders and investors. Build something meaningful.
        </p>
      </div>
    </aside>
  );
}

export default function RegSignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signup, error, isLoading } = useSignup();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const success = await signup(name, email, password);
    if (success === "authenticated") navigate("/");
    if (success === "verificationRequired") navigate("/check-email", { state: { email } });
    if (success === "verificationEmailFailed") navigate("/check-email", { state: { email, deliveryFailed: true } });
  };

  return (
    <section
      className="auth-page-enter w-full! bg-[#F0F4EE]!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="mx-auto! flex! min-h-[calc(100svh-86px)]! w-full! max-w-[1440px]! items-center! justify-center! px-4! py-4! sm:px-6! lg:px-8!">
        <div className="grid! w-full! max-w-[980px]! grid-cols-1! overflow-hidden! rounded-[22px]! border! border-[#DAE4DA]! bg-white! shadow-[0_18px_55px_rgba(38,62,43,0.08)]! lg:grid-cols-2!">

          {/* Form appears on the right on desktop */}
          <div className="flex! min-h-[590px]! flex-col! bg-[#FEFFFC]! px-6! py-6! sm:px-9! lg:order-2! lg:px-10! lg:py-7!">
            <Link
              to="/"
              className="inline-flex! w-fit! items-center! gap-2.5! text-[#24352E]! no-underline!"
            >
              <span className="flex! h-9! w-9! items-center! justify-center! rounded-xl! bg-[#E8F2E9]! text-[#176D5D]!">
                <svg width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m3 17 6-6 4 4 8-8" />
                  <path d="M15 7h6v6" />
                </svg>
              </span>
              <span className="text-[20px]! font-semibold! tracking-[-0.04em]!">
                Innovest<span className="text-[#176D5D]!">.</span>
              </span>
            </Link>

            <div className="mx-auto! flex! w-full! max-w-[355px]! flex-1! flex-col! justify-center! py-3!">
              <p className="mb-2! text-[10px]! font-semibold! tracking-[0.15em]! text-[#64816B]!">
                JOIN INNOVEST
              </p>

              <h1 className="m-0! text-[34px]! font-semibold! leading-[1.15]! tracking-[-0.045em]! text-[#20392B]!">
                Create your account.
              </h1>

              <p className="mb-0! mt-2! text-[13px]! leading-[1.6]! text-[#758379]!">
                Connect with a community of founders and investors.
              </p>

              <form
                onSubmit={handleSubmit}
                autoComplete="on"
                className="mt-6! flex! flex-col! gap-3.5!"
              >
                <div>
                  <label htmlFor="signup-name"
                    className="mb-1.5! block! text-[12px]! font-medium! text-[#334B3A]!">
                    Full name
                  </label>
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="signup-email"
                    className="mb-1.5! block! text-[12px]! font-medium! text-[#334B3A]!">
                    Email address
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="signup-password"
                    className="mb-1.5! block! text-[12px]! font-medium! text-[#334B3A]!">
                    Password
                  </label>
                  <div className="relative!">
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={128}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className={`${inputClass} pr-12!`}
                    />
                    <button
                      type="button"
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
                  <p className="mb-0! mt-1! text-[11px]! text-[#758379]!">Use at least 12 characters.</p>
                </div>

                {error && (
                  <div role="alert"
                    className="rounded-lg! border! border-[#EBC9C4]! bg-[#FFF4F2]! px-3! py-2.5! text-[12px]! text-[#B34942]!">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1! flex! min-h-[47px]! w-full! items-center! justify-center! gap-2! rounded-lg! border-0! bg-[#345C3D]! px-5! text-[14px]! font-semibold! text-white! transition-colors! hover:bg-[#254B33]! disabled:cursor-not-allowed! disabled:opacity-60!"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                  {!isLoading && <span aria-hidden="true">→</span>}
                </button>
              </form>

              <GoogleSignIn />

              <p className="mb-0! mt-5! text-center! text-[12px]! text-[#77857B]!">
                Already have an account?{" "}
                <Link to="/login"
                  className="font-semibold! text-[#345C3D]! no-underline! hover:underline!">
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mb-0! text-[10px]! text-[#9AAA9C]!">
              INNOVEST · CONNECTING IDEAS AND OPPORTUNITY
            </p>
          </div>

          {/* Illustration appears on the left on desktop */}
          <SignupArtwork />
        </div>
      </div>
    </section>
  );
}
