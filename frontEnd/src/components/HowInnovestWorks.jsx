
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Explore opportunities",
    description:
      "Discover startup pitches and investor requests. Find ideas, businesses, and opportunities that match your interests.",
    icon: "search",
  },
  {
    number: "02",
    title: "Present your vision",
    description:
      "Share your business idea, highlight its potential, and introduce your venture to people who can help it grow.",
    icon: "document",
  },
  {
    number: "03",
    title: "Make meaningful connections",
    description:
      "Connect with founders and investors, start conversations, and explore the possibilities together.",
    icon: "message",
  },
];

function StepIcon({ type }) {
  const iconProps = {
    width: 23,
    height: 23,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "search") {
    return (
      <svg {...iconProps}>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </svg>
    );
  }

  if (type === "document") {
    return (
      <svg {...iconProps}>
        <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v6h5M9 13h6M9 17h6" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8 11h8M8 14h5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export default function HowInnovestWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="w-full! bg-[#F7F9F6]! py-20! sm:py-24! lg:py-32!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="mx-auto! grid! w-full! max-w-[1440px]!
                   grid-cols-1! gap-12! px-5!
                   sm:px-8! lg:grid-cols-[0.9fr_1.1fr]!
                   lg:gap-20! lg:px-12! xl:px-16!"
      >
        {/* LEFT: SECTION INTRO */}
        <div className="min-w-0!">
          <div className="mb-6! inline-flex! items-center! gap-2!">
            <span className="h-2! w-2! rounded-full! bg-[#21866D]!" />

            <span
              className="text-[12px]! font-semibold!
                         tracking-[0.16em]! text-[#176D5D]!
                         uppercase!"
            >
              How Innovest works
            </span>
          </div>

          <h2
            id="how-it-works-heading"
            className="m-0! max-w-[570px]!
                       text-[clamp(2.3rem,4vw,3.8rem)]!
                       font-semibold! leading-[1.12]!
                       tracking-[-0.045em]! text-[#24352E]!"
          >
            Great ideas start with{" "}
            <span className="text-[#1B795D]!">
              meaningful connections.
            </span>
          </h2>

          <p
            className="mb-0! mt-6! max-w-[480px]!
                       text-[16px]! leading-[1.8]!
                       text-[#6D7C71]!"
          >
            Bringing investors and entrepreneurs together
            shouldn't be complicated. Innovest makes it
            easier to discover ideas, share opportunities,
            and start the right conversations.
          </p>

          <Link
            to="/pitches"
            className="mt-8! inline-flex! min-h-12!
                       items-center! justify-center! gap-3!
                       rounded-xl! bg-[#24352E]! px-6!
                       py-3.5! text-[14px]! font-semibold!
                       text-white! no-underline!
                       transition-all! duration-200!
                       hover:-translate-y-0.5!
                       hover:bg-[#176D5D]! hover:text-white!"
          >
            Explore opportunities
            <ArrowIcon />
          </Link>

          {/* SMALL SIGNATURE DETAIL */}
          <div
            className="mt-12! flex! max-w-[480px]!
                       items-center! gap-4! border-t!
                       border-[#DCE7DE]! pt-6!"
          >
            <span
              className="text-[12px]! font-semibold!
                         tracking-[0.1em]! text-[#176D5D]!"
            >
              INNOVEST
            </span>

            <span className="h-px! flex-1! bg-[#D4E2D7]!" />

            <span className="text-[12px]! text-[#8A9A8D]!">
              Connect · Collaborate · Grow
            </span>
          </div>
        </div>

        {/* RIGHT: NUMBERED PROCESS */}
        <div className="min-w-0!">
          <div
            className="flex! items-center! justify-between!
                       gap-3! border-b! border-[#DCE7DE]!
                       pb-5!"
          >
            <span
              className="text-[12px]! font-semibold!
                         tracking-[0.12em]! text-[#677A6C]!
                         uppercase!"
            >
              The process
            </span>

            <span
              className="text-[12px]! font-medium!
                         text-[#9AAA9D]!"
            >
              01 — 03
            </span>
          </div>

          <div className="flex! flex-col!">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group grid! grid-cols-[46px_1fr]!
                           gap-4! border-b! border-[#DCE7DE]!
                           py-8! sm:grid-cols-[62px_1fr]!
                           sm:gap-5! sm:py-10!"
              >
                {/* STEP NUMBER */}
                <div className="pt-1!">
                  <span
                    className="text-[16px]! font-semibold!
                               tracking-[-0.025em]! text-[#1B795D]!"
                  >
                    {step.number}
                  </span>
                </div>

                {/* STEP CONTENT */}
                <div className="min-w-0!">
                  <div className="flex! items-start! justify-between! gap-4!">
                    <h3
                      className="m-0! max-w-[410px]!
                                 text-[22px]! font-semibold!
                                 leading-[1.3]! tracking-[-0.025em]!
                                 text-[#24352E]! sm:text-[26px]!"
                    >
                      {step.title}
                    </h3>

                    <span
                      className="flex! h-11! w-11! shrink-0!
                                 items-center! justify-center!
                                 rounded-[13px]! border!
                                 border-[#DCE9DF]! bg-white!
                                 text-[#176D5D]!
                                 transition-all! duration-300!
                                 group-hover:border-[#B8D7C3]!
                                 group-hover:bg-[#E8F2EC]!"
                    >
                      <StepIcon type={step.icon} />
                    </span>
                  </div>

                  <p
                    className="mb-0! mt-3! max-w-[460px]!
                               text-[15px]! leading-[1.8]!
                               text-[#6D7C71]!"
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            className="mb-0! mt-6! text-[12px]!
                       leading-[1.7]! text-[#8A998D]!"
          >
            Every opportunity begins with a conversation.
          </p>
        </div>
      </div>
    </section>
  );
}
