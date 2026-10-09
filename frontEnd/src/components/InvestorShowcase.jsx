
import { Link } from "react-router-dom";

const investorCategories = [
  "Climate & sustainability",
  "Digital innovation",
  "Consumer businesses",
];

const founderSteps = [
  {
    title: "Share your vision",
    description: "Introduce your business",
  },
  {
    title: "Present your pitch",
    description: "Show what makes it unique",
  },
  {
    title: "Connect with investors",
    description: "Build meaningful relationships",
  },
];

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
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

function InvestorVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative! flex! min-h-[320px]! items-center! justify-center! overflow-hidden! bg-[#EDF4EF]! p-5! sm:p-8!"
    >
      {/* Subtle background decoration */}
      <div className="pointer-events-none! absolute! -right-20! -top-24! h-72! w-72! rounded-full! border! border-[#D2E6D8]!" />
      <div className="pointer-events-none! absolute! -bottom-28! -left-20! h-64! w-64! rounded-full! border! border-[#D2E6D8]!" />

      {/* Discovery panel */}
      <div className="relative! z-10! w-full! max-w-[420px]! rounded-[22px]! border! border-[#E0E9E1]! bg-white! p-5! shadow-[0_18px_45px_rgba(32,67,43,0.08)]! sm:p-6!">
        <div className="flex! items-start! justify-between! gap-3!">
          <div>
            <span className="text-[10px]! font-semibold! tracking-[0.15em]! text-[#1B795D]! uppercase!">
              Opportunity explorer
            </span>

            <h3 className="mb-0! mt-2! text-[21px]! font-semibold! tracking-[-0.035em]! text-[#24352E]!">
              Discover ventures
            </h3>
          </div>

          <div className="flex! h-10! w-10! shrink-0! items-center! justify-center! rounded-xl! bg-[#E9F3EC]! text-[#176D5D]!">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" />
            </svg>
          </div>
        </div>

        <div className="mt-5! border-t! border-[#E8EFE9]! pt-4!">
          <p className="mb-3! text-[11px]! font-medium! text-[#89978C]!">
            Explore areas of interest
          </p>

          <div className="flex! flex-col! gap-2!">
            {investorCategories.map((category, index) => (
              <div
                key={category}
                className="flex! items-center! justify-between! gap-3! rounded-xl! border! border-[#EBEFEB]! bg-[#FAFCFA]! px-3! py-3!"
              >
                <div className="flex! min-w-0! items-center! gap-3!">
                  <span className="flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-lg! bg-[#E7F1E9]! text-[11px]! font-semibold! text-[#176D5D]!">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-[13px]! font-medium! text-[#3A4D40]!">
                    {category}
                  </span>
                </div>

                <span className="shrink-0! text-[#779C82]!">
                  <ArrowIcon />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FounderVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative! flex! min-h-[320px]! items-center! justify-center! overflow-hidden! bg-[#F4F1EA]! p-5! sm:p-8!"
    >
      {/* Subtle background decoration */}
      <div className="pointer-events-none! absolute! -right-20! -top-24! h-72! w-72! rounded-full! border! border-[#E7DFD0]!" />
      <div className="pointer-events-none! absolute! -bottom-28! -left-20! h-64! w-64! rounded-full! border! border-[#E7DFD0]!" />

      {/* Founder workspace */}
      <div className="relative! z-10! w-full! max-w-[420px]! rounded-[22px]! border! border-[#EBE5D9]! bg-white! p-5! shadow-[0_18px_45px_rgba(75,65,44,0.07)]! sm:p-6!">
        <div className="flex! items-start! justify-between! gap-3!">
          <div>
            <span className="text-[10px]! font-semibold! tracking-[0.15em]! text-[#937A50]! uppercase!">
              Founder journey
            </span>

            <h3 className="mb-0! mt-2! text-[21px]! font-semibold! tracking-[-0.035em]! text-[#24352E]!">
              From idea to growth
            </h3>
          </div>

          <div className="flex! h-10! w-10! shrink-0! items-center! justify-center! rounded-xl! bg-[#F5F0E5]! text-[#9A7C49]!">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19 10 13l4 3 6-9" />
              <path d="M15 7h5v5" />
            </svg>
          </div>
        </div>

        <div className="mt-5! flex! flex-col! gap-2! border-t! border-[#EEEAE2]! pt-4!">
          {founderSteps.map((step, index) => (
            <div
              key={step.title}
              className="flex! items-center! gap-3! rounded-xl! border! border-[#F0EDE6]! bg-[#FCFBF8]! px-3! py-3!"
            >
              <span className="flex! h-10! w-10! shrink-0! items-center! justify-center! rounded-lg! bg-[#F2EDE2]! text-[12px]! font-semibold! text-[#927A52]!">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0!">
                <p className="mb-0! text-[13px]! font-semibold! text-[#3A463C]!">
                  {step.title}
                </p>

                <p className="mb-0! mt-0.5! text-[11px]! text-[#879187]!">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const pathways = [
  {
    number: "01",
    category: "FOR INVESTORS",
    title: "Find ideas worth backing.",
    description:
      "Explore emerging ventures, discover ambitious founders, and connect with opportunities that match your interests.",
    action: "Explore investments",
    to: "/pitches",
    visual: "investor",
  },
  {
    number: "02",
    category: "FOR ENTREPRENEURS",
    title: "Give your vision room to grow.",
    description:
      "Present your business, meet potential investors, and build the connections that can help you move forward.",
    action: "Start fundraising",
    to: "/fundraise-dashboard",
    visual: "founder",
  },
];

export default function InvestorShowcase() {
  return (
    <section
      aria-labelledby="innovest-showcase-title"
      className="w-full! border-t! border-[#E9EFEA]! bg-white! py-20! sm:py-24! lg:py-28!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="mx-auto! w-full! max-w-[1440px]! px-5! sm:px-8! lg:px-12! xl:px-16!">

        {/* SECTION HEADING */}
        <div className="mb-12! flex! flex-col! gap-5! lg:flex-row! lg:items-end! lg:justify-between!">
          <div className="max-w-[750px]!">
            <p className="mb-4! text-[12px]! font-semibold! tracking-[0.16em]! text-[#176D5D]! uppercase!">
              Built for both sides
            </p>

            <h2
              id="innovest-showcase-title"
              className="m-0! text-[clamp(2.1rem,4vw,3.65rem)]! font-semibold! leading-[1.13]! tracking-[-0.045em]! text-[#24352E]!"
            >
              Two journeys.{" "}
              <span className="text-[#1B795D]!">
                One place to connect.
              </span>
            </h2>
          </div>

          <p className="m-0! max-w-[360px]! text-[16px]! leading-[1.75]! text-[#6D7C71]!">
            Whether you&apos;re building a business or looking
            to back one, there&apos;s a place for you here.
          </p>
        </div>

        {/* AUDIENCE CARDS */}
        <div className="grid! grid-cols-1! gap-6! lg:grid-cols-2! lg:gap-7!">
          {pathways.map((item) => (
            <article
              key={item.number}
              className="group flex! min-w-0! flex-col! overflow-hidden! rounded-[26px]! border! border-[#E4EBE5]! bg-[#FCFDFB]! transition-all! duration-300! hover:-translate-y-1! hover:shadow-[0_20px_44px_rgba(35,57,42,0.08)]!"
            >
              {/* VISUAL AREA */}
              {item.visual === "investor" ? (
                <InvestorVisual />
              ) : (
                <FounderVisual />
              )}

              {/* CARD CONTENT */}
              <div className="flex! flex-1! flex-col! p-6! sm:p-8! xl:p-9!">
                <div className="mb-4! flex! items-center! gap-3!">
                  <span className="text-[12px]! font-semibold! text-[#176D5D]!">
                    {item.number}
                  </span>

                  <span className="h-px! w-6! bg-[#C6D9CB]!" />

                  <span className="text-[11px]! font-semibold! tracking-[0.1em]! text-[#829087]!">
                    {item.category}
                  </span>
                </div>

                <h3 className="m-0! text-[27px]! font-semibold! leading-[1.2]! tracking-[-0.035em]! text-[#24352E]! sm:text-[31px]!">
                  {item.title}
                </h3>

                <p className="mb-7! mt-4! max-w-[470px]! text-[15px]! leading-[1.8]! text-[#6D7C71]! sm:text-[16px]!">
                  {item.description}
                </p>

                <div className="mt-auto! border-t! border-[#E4EBE5]! pt-5!">
                  <Link
                    to={item.to}
                    className="inline-flex! items-center! gap-3! text-[15px]! font-semibold! text-[#176D5D]! no-underline! transition-colors! hover:text-[#24352E]!"
                  >
                    {item.action}

                    <span className="inline-flex! h-9! w-9! items-center! justify-center! rounded-full! border! border-[#D6E7DB]! bg-[#EAF4ED]! transition-transform! duration-200! group-hover:translate-x-1!">
                      <ArrowIcon />
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
