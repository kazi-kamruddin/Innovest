
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
  FiCoffee,
  FiCpu,
  FiHeart,
  FiHome,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import AnimatedHeaderText from "./AnimatedHeaderText";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/pitch-all.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Education",
  "Food & Beverage",
  "Other",
];

const STAGES = [
  "Idea",
  "Prototype",
  "Early Revenue",
  "Scaling",
  "Profitable",
];

const COUNTRIES = [
  "Afghanistan",
  "Bangladesh",
  "Bhutan",
  "India",
  "Maldives",
  "Nepal",
  "Pakistan",
  "Sri Lanka",
];

const industryIcons = {
  Technology: FiCpu,
  Healthcare: FiHeart,
  Finance: FiTrendingUp,
  "Real Estate": FiHome,
  Education: FiBookOpen,
  "Food & Beverage": FiCoffee,
  Other: FiBriefcase,
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatAmount(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not specified";
  }

  const text = String(value).trim();
  const numeric = Number(text.replace(/[$,]/g, ""));

  return Number.isFinite(numeric)
    ? `$${numberFormatter.format(numeric)}`
    : text;
}

/* ==========================================
   FILTER SELECT
========================================== */

function FilterSelect({
  label,
  allLabel,
  value,
  onChange,
  options,
  icon: Icon,
}) {
  return (
    <label className="block! min-w-0! flex-1!">
      <span
        className="mb-2! block! text-[12px]!
                   font-semibold! text-[#476052]!"
      >
        {label}
      </span>

      <span className="relative! block!">
        <Icon
          size={17}
          aria-hidden="true"
          className="pointer-events-none! absolute!
                     left-3.5! top-1/2! z-10!
                     -translate-y-1/2! text-[#739281]!"
        />

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block! h-[47px]! w-full!
                     cursor-pointer! appearance-none!
                     rounded-xl! border!
                     border-[#B8CDBD]! bg-[#FBFDFB]!
                     py-2! pl-10! pr-10!
                     text-[13px]! font-medium!
                     text-[#31483B]! outline-none!
                     transition-colors! duration-200!
                     hover:border-[#ACC7B2]!
                     focus:border-[#176D5D]!
                     focus:ring-4! focus:ring-[#176D5D]/10!"
        >
          <option value="">{allLabel}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <FiChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none! absolute!
                     right-3.5! top-1/2!
                     -translate-y-1/2! text-[#748D7D]!"
        />
      </span>
    </label>
  );
}

/* ==========================================
   INDIVIDUAL PITCH CARD
========================================== */

function PitchCard({ pitch }) {
  const IndustryIcon =
    industryIcons[pitch.industry] || FiBriefcase;

  const location = [
    pitch.company_location,
    pitch.country,
  ]
    .filter(Boolean)
    .join(", ");

  const marketText =
    pitch.the_market ||
    pitch.the_business ||
    "Market details have not been provided yet.";

  return (
    <article
      className="group flex! h-full! min-w-0!
                 flex-col! overflow-hidden!
                 rounded-[22px]! border!
                 border-[#8FAF98]! bg-white!
                 shadow-[0_6px_24px_rgba(36,63,44,0.035)]!
                 transition-all! duration-300!
                 hover:-translate-y-1!
                 hover:border-[#BFD8C5]!
                 hover:shadow-[0_20px_45px_rgba(36,63,44,0.09)]!"
    >
      {/* DECORATIVE CARD HEADER */}
      <div
        className="relative! isolate! flex!
                   min-h-[137px]! flex-col!
                   justify-between! overflow-hidden!
                   bg-[#EAF3E9]! px-5! py-5!
                   sm:px-6!"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none! absolute!
                     -right-10! -top-24!
                     h-[250px]! w-[250px]!
                     rounded-full! border!
                     border-[#D4E5D4]!"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none! absolute!
                     -right-1! -top-14!
                     h-[175px]! w-[175px]!
                     rounded-full! border!
                     border-[#D4E5D4]!"
        />

        <div
          className="relative! z-10! flex!
                     items-start! justify-between! gap-3!"
        >
          <span
            className="flex! h-11! w-11!
                       shrink-0! items-center!
                       justify-center! rounded-[13px]!
                       border! border-white/80!
                       bg-white/75! text-[#176D5D]!
                       shadow-sm!"
          >
            <IndustryIcon size={21} aria-hidden="true" />
          </span>

          <span
            className="max-w-[70%]! truncate!
                       rounded-full! border!
                       border-[#CEE1D2]! bg-white/75!
                       px-3! py-1.5!
                       text-[11px]! font-semibold!
                       text-[#416B50]!"
          >
            {pitch.stage || "Stage not specified"}
          </span>
        </div>

        {/* PRESERVES ORIGINAL ANIMATION */}
        <div className="relative! z-10! mt-5!">
          <AnimatedHeaderText pitch={pitch} />
        </div>
      </div>

      {/* CARD CONTENT */}
      <div
        className="flex! flex-1! flex-col!
                   px-5! pb-5! pt-5!
                   sm:px-6! sm:pb-6!"
      >
        <div
          className="flex! flex-wrap!
                     items-center! gap-2!"
        >
          <span
            className="rounded-full! bg-[#F0F6F0]!
                       px-3! py-1.5!
                       text-[11px]! font-semibold!
                       text-[#327153]!"
          >
            {pitch.industry || "Other"}
          </span>

          {pitch.user_name && (
            <span
              className="min-w-0! truncate!
                         text-[11px]! text-[#819184]!"
            >
              by {pitch.user_name}
            </span>
          )}
        </div>

        {/* TITLE */}
        <h2
          className="mb-0! mt-4! line-clamp-2!
                     min-h-[56px]! text-[21px]!
                     font-semibold! leading-[1.35]!
                     tracking-[-0.035em]!
                     text-[#24352E]!"
        >
          {pitch.title || "Untitled opportunity"}
        </h2>

        {/* LOCATION */}
        <p
          className="mb-0! mt-2! flex!
                     min-w-0! items-center! gap-2!
                     text-[12px]! text-[#7B8E80]!"
        >
          <FiMapPin
            size={14}
            aria-hidden="true"
            className="shrink-0! text-[#6E9A79]!"
          />

          <span className="truncate!">
            {location || "Location not specified"}
          </span>
        </p>

        {/* MARKET DESCRIPTION */}
        <div
          className="mt-5! border-t!
                     border-[#ECF1EC]! pt-4!"
        >
          <p
            className="mb-2! text-[10px]!
                       font-bold! tracking-[0.13em]!
                       text-[#6E8B75]! uppercase!"
          >
            The market
          </p>

          <p
            className="mb-0! line-clamp-3!
                       min-h-[61px]! text-[13px]!
                       leading-[1.6]! text-[#697B6F]!"
          >
            {marketText}
          </p>
        </div>

        {/* FUNDING INFORMATION */}
        <div className="mt-auto! pt-5!">
          <div
            className="grid! grid-cols-2!
                       gap-3! rounded-[14px]!
                       border! border-[#E5EEE6]!
                       bg-[#F8FBF8]! px-4! py-3.5!"
          >
            <div className="min-w-0!">
              <p
                className="mb-1.5!
                           text-[10px]! font-semibold!
                           tracking-[0.07em]!
                           text-[#86998A]! uppercase!"
              >
                Raising
              </p>

              <p
                className="mb-0! break-words!
                           text-[16px]! font-semibold!
                           tracking-[-0.02em]!
                           text-[#254B34]!"
              >
                {formatAmount(pitch.total_raising_amount)}
              </p>
            </div>

            <div
              className="min-w-0! border-l!
                         border-[#E1EAE2]! pl-3!"
            >
              <p
                className="mb-1.5!
                           text-[10px]! font-semibold!
                           tracking-[0.07em]!
                           text-[#86998A]! uppercase!"
              >
                Min. investment
              </p>

              <p
                className="mb-0! break-words!
                           text-[16px]! font-semibold!
                           tracking-[-0.02em]!
                           text-[#254B34]!"
              >
                {formatAmount(pitch.minimum_investment)}
              </p>
            </div>
          </div>

          {/* CONTACT */}
          {pitch.cell_number && (
            <p
              className="mb-0! mt-3! truncate!
                         text-[11px]! text-[#8A9A8E]!"
            >
              Contact: {pitch.cell_number}
            </p>
          )}

          {/* DETAILS LINK */}
          <Link
            to={`/pitches/${pitch.id}`}
            className="mt-4! flex! min-h-[46px]!
                       w-full! items-center!
                       justify-between! gap-3!
                       rounded-xl! bg-[#243E30]!
                       px-4! py-3!
                       text-[13px]! font-semibold!
                       text-white! no-underline!
                       transition-colors! duration-200!
                       hover:bg-[#176D5D]!
                       hover:text-white!
                       focus-visible:outline!
                       focus-visible:outline-2!
                       focus-visible:outline-offset-2!
                       focus-visible:outline-[#176D5D]!"
          >
            View pitch details

            <FiArrowUpRight
              size={18}
              aria-hidden="true"
              className="transition-transform! duration-200!
                         group-hover:translate-x-0.5!
                         group-hover:-translate-y-0.5!"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   LOADING SKELETONS
========================================== */

function LoadingCards() {
  return (
    <div
      className="grid! grid-cols-1!
           gap-5! md:grid-cols-2!"
      aria-hidden="true"
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden!
                     rounded-[22px]! border!
                     border-[#E5EEE6]! bg-white!"
        >
          <div
            className="h-[137px]! animate-pulse!
                       bg-[#EAF3E9]!"
          />

          <div className="space-y-4! p-6!">
            <div className="h-4! w-20! animate-pulse! rounded! bg-[#EAF0EA]!" />
            <div className="h-6! w-4/5! animate-pulse! rounded! bg-[#EAF0EA]!" />
            <div className="h-3! w-1/2! animate-pulse! rounded! bg-[#EEF3EE]!" />
            <div className="h-16! animate-pulse! rounded! bg-[#F1F5F1]!" />
            <div className="h-16! animate-pulse! rounded-xl! bg-[#F1F5F1]!" />
            <div className="h-11! animate-pulse! rounded-xl! bg-[#EAF0EA]!" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==========================================
   MAIN MARKETPLACE PAGE
========================================== */

export default function PitchAll() {
  const { user } = useAuthContext();

  const [pitches, setPitches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  /* FETCH PITCHES */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPitches() {
      setIsLoading(true);
      setFetchError("");

      try {
        if (!API_BASE) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const params = new URLSearchParams({
          industry: industryFilter,
          stage: stageFilter,
          country: countryFilter,
        });

        const response = await fetch(
          `${API_BASE}/pitches?${params}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Could not load investment pitches.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response.");
        }

        // Exclude the logged-in user's own pitches.
        const visible = data.filter(
          (pitch) =>
            user?.id == null ||
            String(pitch.user_id) !== String(user.id)
        );

        if (!controller.signal.aborted) {
          setPitches(visible);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching pitches:", error);

          setFetchError(
            "We couldn't load the opportunities right now. Please try again."
          );

          setPitches([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchPitches();

    return () => controller.abort();
  }, [
    industryFilter,
    stageFilter,
    countryFilter,
    user?.id,
    retryKey,
  ]);

  /* SEARCH RESULTS */
  const filteredPitches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return pitches;

    return pitches.filter(
      (pitch) =>
        String(pitch.title || "")
          .toLowerCase()
          .includes(term) ||
        String(pitch.country || "")
          .toLowerCase()
          .includes(term)
    );
  }, [pitches, searchTerm]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    industryFilter ||
    stageFilter ||
    countryFilter
  );

  function clearFilters() {
    setSearchTerm("");
    setIndustryFilter("");
    setStageFilter("");
    setCountryFilter("");
  }

  return (
    <section
      className="innovest-marketplace
                 min-h-[calc(100svh-86px)]!
                 w-full! bg-[#FCFDFB]!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="mx-auto! w-full!
                   max-w-[1360px]!
                   px-5! pb-20! pt-12!
                   sm:px-8! lg:px-12!
                   lg:pt-16! xl:px-14!"
      >
        {/* ==================================
            PAGE HEADING
        ================================== */}

        <header
          className="flex! flex-col!
                     justify-between! gap-7!
                     border-b! border-[#E4ECE5]!
                     pb-10!
                     lg:flex-row! lg:items-end!"
        >
          <div className="max-w-[780px]!">
            <div
              className="mb-5! inline-flex!
                         items-center! gap-2.5!"
            >
              <span
                className="h-2! w-2!
                           rounded-full!
                           bg-[#176D5D]!"
              />

              <span
                className="text-[11px]! font-bold!
                           tracking-[0.17em]!
                           text-[#176D5D]! uppercase!"
              >
                The Innovest marketplace
              </span>
            </div>


            <h1
              className="m-0!
                          text-[clamp(1.95rem,3vw,2.65rem)]!
                          font-semibold! leading-[1.12]!
                          tracking-[-0.045em]!
                          text-[#24352E]!"
            >

              Discover ideas{" "}
              <span className="text-[#176D5D]!">
                worth backing.
              </span>
            </h1>

            <p
              className="mb-0! mt-5!
                         max-w-[650px]!
                         text-[15px]! leading-[1.8]!
                         text-[#75877A]!
                         sm:text-[16px]!"
            >
              Explore investment opportunities, learn
              about ambitious businesses, and connect
              with the people building what&apos;s next.
            </p>
          </div>

          <Link
            to="/fundraise-dashboard"
            className="inline-flex! w-fit! shrink-0!
                       items-center! gap-2!
                       rounded-full! border!
                       border-[#DAE6DC]! bg-white!
                       px-5! py-3!
                       text-[13px]! font-semibold!
                       text-[#315B40]! no-underline!
                       transition-all! duration-200!
                       hover:border-[#A7C8AF]!
                       hover:bg-[#F0F7F1]!
                       hover:text-[#176D5D]!"
          >
            Have an idea to share?
            <FiArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </header>

        {/* ==================================
            SEARCH AND FILTER PANEL
        ================================== */}

        <div
          className="mt-8! rounded-[22px]!
                     border! border-[#E0E9E1]!
                     bg-white! p-5!
                     shadow-[0_8px_35px_rgba(33,63,41,0.035)]!
                     sm:p-6!"
        >
          <div
            className="mb-4! flex!
                       items-center! gap-2!"
          >
            <FiSliders
              size={16}
              aria-hidden="true"
              className="text-[#176D5D]!"
            />

            <span
              className="text-[13px]!
                         font-semibold! text-[#344D3B]!"
            >
              Find the right opportunity
            </span>
          </div>

          {/* SEARCH FIELD */}
          <div className="relative!">
            <label
              htmlFor="pitch-search"
              className="sr-only!"
            >
              Search pitches by title or country
            </label>

            <FiSearch
              size={19}
              aria-hidden="true"
              className="pointer-events-none!
                         absolute! left-4! top-1/2!
                         -translate-y-1/2!
                         text-[#7B9682]!"
            />

            <input
              id="pitch-search"
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by pitch title or country..."
              className="block! h-[52px]! w-full!
                         rounded-xl! border!
                         border-[#DCE8DE]!
                         bg-[#FBFDFB]!
                         py-3! pl-12! pr-12!
                         text-[14px]! text-[#24352E]!
                         outline-none!
                         placeholder:text-[#9AAA9E]!
                         transition-colors! duration-200!
                         hover:border-[#ACC7B2]!
                         focus:border-[#176D5D]!
                         focus:ring-4!
                         focus:ring-[#176D5D]/10!"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute! right-2.5!
                           top-1/2! inline-flex!
                           h-9! w-9!
                           -translate-y-1/2!
                           items-center! justify-center!
                           rounded-lg! border-0!
                           bg-transparent!
                           text-[#819385]!
                           transition-colors!
                           hover:bg-[#EDF5EE]!
                           hover:text-[#176D5D]!"
              >
                <FiX
                  size={17}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {/* FILTERS */}


          {/* FILTERS */}
          <div className="pitch-filter-grid mt-5!">
            <FilterSelect
              label="Industry"
              allLabel="All industries"
              icon={FiBriefcase}
              value={industryFilter}
              onChange={setIndustryFilter}
              options={INDUSTRIES}
            />

            <FilterSelect
              label="Stage"
              allLabel="All stages"
              icon={FiTrendingUp}
              value={stageFilter}
              onChange={setStageFilter}
              options={STAGES}
            />

            <FilterSelect
              label="Country"
              allLabel="All countries"
              icon={FiMapPin}
              value={countryFilter}
              onChange={setCountryFilter}
              options={COUNTRIES}
            />
          </div>


          {/* RESET FILTERS */}
          <div
            className="mt-4! flex!
                       min-h-[26px]! items-center!
                       justify-between! gap-3!"
          >
            <span
              className="text-[11px]!
                         text-[#91A094]!"
            >
              Search and filters work together
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex! items-center!
                           gap-1.5! border-0!
                           bg-transparent! p-0!
                           text-[12px]! font-semibold!
                           text-[#176D5D]!
                           hover:text-[#24352E]!"
              >
                <FiX
                  size={14}
                  aria-hidden="true"
                />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* ==================================
            RESULTS HEADING
        ================================== */}

        <div
          className="mb-5! mt-10! flex!
                     flex-wrap! items-center!
                     justify-between! gap-3!"
        >
          <div>
            <h2
              className="m-0! text-[21px]!
                         font-semibold!
                         tracking-[-0.035em]!
                         text-[#24352E]!"
            >
              Explore opportunities
            </h2>

            <p
              className="mb-0! mt-1!
                         text-[12px]!
                         text-[#819186]!"
              aria-live="polite"
            >
              {isLoading
                ? "Loading available pitches..."
                : fetchError
                  ? "Unable to load results"
                  : `${filteredPitches.length} ${filteredPitches.length === 1
                    ? "pitch"
                    : "pitches"
                  } found`}
            </p>
          </div>

          {!isLoading && !fetchError && (
            <span
              className="rounded-full! border!
                         border-[#DAE7DC]!
                         bg-[#F2F8F3]!
                         px-3.5! py-2!
                         text-[11px]! font-semibold!
                         text-[#4D7A59]!"
            >
              {filteredPitches.length} available to explore
            </span>
          )}
        </div>

        {/* ==================================
            CONTENT STATES
        ================================== */}

        {isLoading ? (
          <LoadingCards />
        ) : fetchError ? (
          /* API ERROR */
          <div
            className="rounded-[22px]! border!
                       border-[#E2EAE3]! bg-white!
                       px-6! py-14! text-center!"
          >
            <FiRefreshCw
              size={26}
              aria-hidden="true"
              className="mx-auto! text-[#4F805C]!"
            />

            <h3
              className="mb-0! mt-4!
                         text-[20px]! font-semibold!
                         text-[#24352E]!"
            >
              Opportunities aren&apos;t loading
            </h3>

            <p
              className="mx-auto! mb-0! mt-2!
                         max-w-[440px]!
                         text-[13px]! leading-[1.7]!
                         text-[#7B8D80]!"
            >
              {fetchError}
            </p>

            <button
              type="button"
              onClick={() =>
                setRetryKey((count) => count + 1)
              }
              className="mt-6! inline-flex!
                         items-center! gap-2!
                         rounded-xl! border-0!
                         bg-[#243E30]! px-5! py-3!
                         text-[13px]! font-semibold!
                         text-white!
                         transition-colors!
                         hover:bg-[#176D5D]!
                         hover:text-white!"
            >
              <FiRefreshCw
                size={15}
                aria-hidden="true"
              />
              Try again
            </button>
          </div>
        ) : filteredPitches.length > 0 ? (
          /* PITCH CARDS */

          <div
            className="grid! grid-cols-1!
                      items-stretch! gap-5!
                      md:grid-cols-2!
                      xl:gap-6!"
          >

            {filteredPitches.map((pitch) => (
              <PitchCard
                key={pitch.id}
                pitch={pitch}
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div
            className="rounded-[22px]! border!
                       border-[#E2EAE3]! bg-white!
                       px-6! py-16! text-center!"
          >
            <span
              className="mx-auto! flex!
                         h-14! w-14!
                         items-center! justify-center!
                         rounded-2xl! bg-[#EFF6F0]!
                         text-[#36724F]!"
            >
              <FiSearch
                size={25}
                aria-hidden="true"
              />
            </span>

            <h3
              className="mb-0! mt-5!
                         text-[21px]! font-semibold!
                         text-[#24352E]!"
            >
              {hasActiveFilters
                ? "No matching opportunities"
                : "No pitches available yet"}
            </h3>

            <p
              className="mx-auto! mb-0! mt-2!
                         max-w-[450px]!
                         text-[13px]! leading-[1.7]!
                         text-[#7B8D80]!"
            >
              {hasActiveFilters
                ? "Try another search or adjust your filters to explore more pitches."
                : "When entrepreneurs share their pitches, you'll find them here."}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6! inline-flex!
                           items-center! gap-2!
                           rounded-xl! border-0!
                           bg-[#243E30]!
                           px-5! py-3!
                           text-[13px]! font-semibold!
                           text-white!
                           transition-colors!
                           hover:bg-[#176D5D]!
                           hover:text-white!"
              >
                Show all pitches
                <FiArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
