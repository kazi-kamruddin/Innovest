
import { Link } from "react-router-dom";

const bars = [34, 47, 40, 59, 53, 72, 64, 83, 75, 94];

function ArrowIcon({ diagonal = false }) {
  return diagonal ? (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function LandingHero() {
  return (
    <section
      aria-labelledby="innovest-hero-title"
      className="relative! isolate! w-full! overflow-hidden! bg-[#FCFDFB]! text-[#24352E]!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Subtle background detail */}
      <div
        aria-hidden="true"
        className="pointer-events-none! absolute! -right-32! top-0! h-[480px]! w-[480px]! rounded-full! opacity-40! blur-[100px]!"
        style={{ background: "#DDEDE2" }}
      />

      <div
        className="relative! mx-auto! grid! w-full! max-w-[1440px]! grid-cols-1! items-center! gap-12! px-5! pb-16! pt-14! sm:px-8! sm:pb-20! sm:pt-20! lg:min-h-[680px]! lg:grid-cols-[1.05fr_0.95fr]! lg:gap-14! lg:px-12! lg:py-24! xl:gap-20! xl:px-16!"
      >
        {/* LEFT CONTENT */}
        <div className="relative! z-10! min-w-0!">
          {/* Eyebrow */}
          <div className="inline-flex! max-w-full! items-center! gap-2! rounded-full! border! border-[#DCE9E0]! bg-[#F1F7F2]! px-3! py-2! text-[11px]! font-semibold! tracking-[0.12em]! text-[#176D5D]! uppercase! sm:text-[12px]!">
            <span
              aria-hidden="true"
              className="inline-block! h-2! w-2! shrink-0! rounded-full! bg-[#21866D]!"
            />
            Where founders and investors connect
          </div>

          {/* Main headline */}
          <h1
            id="innovest-hero-title"
            className="mb-0! mt-7! max-w-[690px]! text-[clamp(2.7rem,5.2vw,5.1rem)]! font-semibold! leading-[1.06]! tracking-[-0.048em]! text-[#203129]!"
          >
            Big ideas deserve{" "}
            <span className="text-[#1B795D]!">
              the right backing.
            </span>
          </h1>

          {/* Description */}
          <p className="mb-0! mt-6! max-w-[540px]! text-[16px]! font-normal! leading-[1.8]! text-[#65736A]! sm:text-[18px]!">
            Innovest brings ambitious entrepreneurs and
            forward-thinking investors together.
            Discover opportunities, build connections,
            and turn possibility into progress.
          </p>

          {/* Call to action */}
          <div className="mt-8! flex! flex-col! gap-3! sm:flex-row! sm:items-center! sm:gap-4!">
            <Link
              to="/pitches"
              className="inline-flex! min-h-12! items-center! justify-center! gap-3! rounded-xl! bg-[#24352E]! px-6! py-3.5! text-[15px]! font-semibold! text-white! no-underline! shadow-[0_8px_22px_rgba(24,50,36,0.14)]! transition-all! duration-200! hover:-translate-y-0.5! hover:bg-[#176D5D]! hover:text-white!"
            >
              Explore investments
              <ArrowIcon />
            </Link>

            <Link
              to="/fundraise-dashboard"
              className="inline-flex! min-h-12! items-center! justify-center! gap-2! rounded-xl! border! border-[#D3DED6]! bg-white! px-6! py-3.5! text-[15px]! font-semibold! text-[#283D31]! no-underline! transition-all! duration-200! hover:border-[#176D5D]! hover:bg-[#F2F8F3]! hover:text-[#176D5D]!"
            >
              Start fundraising
              <ArrowIcon diagonal />
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-10! flex! max-w-[570px]! flex-col! gap-3! border-t! border-[#E4EAE5]! pt-6! text-[13px]! text-[#5F6E64]! sm:flex-row! sm:gap-7!">
            <span className="inline-flex! items-center! gap-2!">
              <span className="text-[#1B795D]!">
                <CheckIcon />
              </span>
              Find promising ventures
            </span>

            <span className="inline-flex! items-center! gap-2!">
              <span className="text-[#1B795D]!">
                <CheckIcon />
              </span>
              Connect with the right people
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: PLATFORM VISUAL */}
        <div
          className="relative! mx-auto! w-full! max-w-[540px]! min-w-0!"
          aria-label="Illustrative Innovest platform preview"
        >
          <div
            aria-hidden="true"
            className="absolute! -bottom-5! -left-5! h-36! w-36! rounded-full! border! border-[#D4E6D9]! opacity-60!"
          />

          <div className="relative! overflow-hidden! rounded-[30px]! border! border-[#DBE9E0]! bg-[#E9F2EB]! p-4! shadow-[0_22px_64px_rgba(34,68,48,0.10)]! sm:rounded-[36px]! sm:p-7!">
            {/* Visual header */}
            <div className="mb-5! flex! items-center! justify-between! gap-3! px-1!">
              <span className="text-[11px]! font-bold! tracking-[0.14em]! text-[#527364]! uppercase!">
                Discover what&apos;s possible
              </span>

              <span className="inline-flex! items-center! gap-1.5! rounded-full! bg-white/75! px-3! py-1.5! text-[11px]! font-medium! text-[#648072]!">
                <span className="h-1.5! w-1.5! rounded-full! bg-[#71AC8E]!" />
                UI preview
              </span>
            </div>

            {/* Main preview card */}
            <div className="rounded-[24px]! border! border-[#E1EAE3]! bg-white! p-5! shadow-[0_12px_34px_rgba(34,68,48,0.06)]! sm:p-7!">
              <div className="flex! items-center! gap-3!">
                <div className="flex! h-12! w-12! shrink-0! items-center! justify-center! rounded-2xl! bg-[#E7F2EA]! text-[#1B795D]!">
                  <svg
                    aria-hidden="true"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 17.5 9 11l4 4 8-9" />
                    <path d="M15 6h6v6" />
                  </svg>
                </div>

                <div className="min-w-0!">
                  <p className="mb-0! text-[12px]! font-medium! text-[#7B897E]!">
                    The Innovest network
                  </p>

                  <h2 className="mb-0! mt-0.5! text-[21px]! font-semibold! tracking-[-0.035em]! text-[#24352E]! sm:text-[24px]!">
                    Discover. Connect. Grow.
                  </h2>
                </div>
              </div>

              {/* Illustrative growth chart */}
              <div className="mt-6! rounded-[19px]! border! border-[#E5EDE7]! bg-[#F6F9F6]! p-4! sm:p-5!">
                <div className="flex! items-center! justify-between! gap-2!">
                  <span className="text-[12px]! font-semibold! text-[#3B5747]!">
                    Ideas in motion
                  </span>

                  <span className="text-[11px]! font-medium! text-[#90A295]!">
                    Illustrative
                  </span>
                </div>

                <div
                  aria-hidden="true"
                  className="mt-5! flex! h-[100px]! items-end! gap-2! sm:gap-3!"
                >
                  {bars.map((height, index) => (
                    <div
                      key={index}
                      className={`min-w-0! flex-1! rounded-t-[5px]! ${
                        index > 6
                          ? "bg-[#277A5B]!"
                          : "bg-[#A9CEB5]!"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                <div className="mt-3! flex! justify-between! text-[11px]! text-[#87978B]!">
                  <span>Ideas</span>
                  <span>Opportunity</span>
                </div>
              </div>

              {/* Audience cards */}
              <div className="mt-4! grid! grid-cols-2! gap-3!">
                {/* Investors */}
                <div className="rounded-[16px]! border! border-[#E6EBE6]! bg-white! p-3.5! sm:p-4!">
                  <div className="mb-3! flex! h-9! w-9! items-center! justify-center! rounded-xl! bg-[#EAF3EE]! text-[#1B795D]!">
                    <svg
                      aria-hidden="true"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="8" r="3" />
                      <path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8a3 3 0 1 1 0 6M19 20v-2a4 4 0 0 0-2-3.46" />
                    </svg>
                  </div>

                  <p className="mb-0! text-[13px]! font-semibold! text-[#2B4033]!">
                    For investors
                  </p>

                  <p className="mb-0! mt-1! text-[11px]! leading-[1.5]! text-[#7C8C80]!">
                    Explore new ventures
                  </p>
                </div>

                {/* Founders */}
                <div className="rounded-[16px]! border! border-[#E6EBE6]! bg-white! p-3.5! sm:p-4!">
                  <div className="mb-3! flex! h-9! w-9! items-center! justify-center! rounded-xl! bg-[#F1EEE4]! text-[#9D7E3E]!">
                    <svg
                      aria-hidden="true"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </div>

                  <p className="mb-0! text-[13px]! font-semibold! text-[#2B4033]!">
                    For founders
                  </p>

                  <p className="mb-0! mt-1! text-[11px]! leading-[1.5]! text-[#7C8C80]!">
                    Find the right backing
                  </p>
                </div>
              </div>
            </div>

            {/* Visual footer */}
            <div className="mt-5! flex! items-center! justify-between! gap-3! px-1!">
              <span className="text-[12px]! font-medium! tracking-[0.01em]! text-[#527363]!">
                A space where ideas move forward.
              </span>

              <span
                aria-hidden="true"
                className="flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-full! bg-[#D4E7D9]! text-[#176D5D]!"
              >
                <ArrowIcon diagonal />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
