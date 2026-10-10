
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import NotificationBell from './NotificationBell';
import '../styles/notifications.css';

const links = [
  { label: "Invest", to: "/pitches" },
  { label: "Fundraise", to: "/fundraise-dashboard" },
  { label: "Investor Requests", to: "/investor-request" },
  { label: "Messages", to: "/messages" },
  { label: "About Us", to: "/about-us" },
];

const desktopLink = ({ isActive }) =>
  `inline-flex! shrink-0! items-center! justify-center!
   rounded-lg! px-2! py-2.5! text-[14px]!
   no-underline! whitespace-nowrap!
   transition-colors! duration-200!
   focus-visible:outline-2!
   focus-visible:outline-offset-2!
   focus-visible:outline-[#176D5D]!
   ${
     isActive
       ? "bg-[#E8F2ED]! font-bold! text-[#176D5D]!"
       : "bg-transparent! font-medium! text-[#65716C]! hover:bg-[#F0F5F1]! hover:text-[#176D5D]!"
   }`;

const mobileLink = ({ isActive }) =>
  `flex! w-full! items-center! justify-between!
   rounded-xl! px-4! py-3.5! text-[15px]!
   no-underline! transition-colors!
   ${
     isActive
       ? "bg-[#E8F2ED]! font-bold! text-[#176D5D]!"
       : "bg-transparent! font-medium! text-[#34413C]! hover:bg-[#F1F5F2]!"
   }`;

const actionButton =
  `inline-flex! shrink-0! items-center! justify-center!
   gap-2! rounded-xl! bg-[#24352E]! px-5! py-3!
   text-[14px]! font-semibold! text-white! no-underline!
   shadow-sm! transition-all! duration-200!
   hover:bg-[#176D5D]! hover:text-white!
   hover:shadow-md!
   focus-visible:outline-2!
   focus-visible:outline-offset-2!
   focus-visible:outline-[#176D5D]!`;

function Navbar() {
  const { user } = useAuthContext();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  return (
    <header
      className="fixed! inset-x-0! top-0! z-[1000]!
                 h-[86px]! border-b! border-[#E5EBE7]!
                 bg-[#FCFDFB]!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="mx-auto flex! h-full! w-full!
                   max-w-[1440px]! items-center!
                   justify-between! gap-4!
                   px-4! sm:px-7! xl:px-10!"
      >
        {/* LOGO */}
        <NavLink
          to="/"
          aria-label="Innovest homepage"
          onClick={() => setMenuOpen(false)}
          className="inline-flex! shrink-0!
                     items-center! gap-3! no-underline!"
        >
          <span
            className="inline-flex! h-11! w-11!
                       items-center! justify-center!
                       rounded-[13px]! border!
                       border-[#D8E8DE]!
                       bg-[#E8F2ED]! text-[#176D5D]!"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 17l6-6 4 4 8-8" />
              <path d="M15 7h6v6" />
            </svg>
          </span>

          <span
            className="text-[25px]! font-bold!
                       tracking-[-1.2px]! text-[#24352E]!
                       sm:text-[28px]!"
          >
            Innovest
            <span className="text-[#176D5D]!">.</span>
          </span>
        </NavLink>

        {/* DESKTOP NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="hidden! min-w-0! items-center!
                     justify-center! xl:flex!"
          style={{
            columnGap: "clamp(18px, 1.8vw, 30px)",
          }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={desktopLink}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* DESKTOP AUTH */}
        <div
          className="hidden! shrink-0! items-center! xl:flex!"
          style={{ gap: 18 }}
        >
          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-[14px]! no-underline!
                   hover:text-[#176D5D]!
                   ${
                     isActive
                       ? "font-bold! text-[#176D5D]!"
                       : "font-medium! text-[#24352E]!"
                   }`
                }
              >
                Log in
              </NavLink>

              <NavLink
                to="/signup"
                className={actionButton}
              >
                Get started
                <span aria-hidden="true">↗</span>
              </NavLink>
            </>
          ) : (
            <><NotificationBell /><NavLink
              to="/profile"
              className={actionButton}
            >
              Dashboard
              <span aria-hidden="true">↗</span>
            </NavLink></>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-controls="innovest-mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex! h-11! w-11!
                     shrink-0! items-center!
                     justify-center! rounded-xl!
                     border! border-[#DBE6DE]!
                     bg-white! text-[#24352E]!
                     xl:hidden!"
        >
          {menuOpen ? (
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {menuOpen && (
        <div
          id="innovest-mobile-menu"
          className="fixed! inset-x-0!
                     bottom-0! top-[86px]!
                     z-[1001]! xl:hidden!"
        >
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute! inset-0!
                       h-full! w-full!
                       border-0! bg-[#142D21]/25!"
          />

          {/* MENU PANEL */}
          <div
            className="relative!
                       max-h-[calc(100dvh-86px)]!
                       overflow-y-auto!
                       border-b! border-[#E5EBE7]!
                       bg-[#FCFDFB]! px-4! pb-6! pt-3!
                       shadow-[0_18px_35px_rgba(20,40,25,0.10)]!
                       sm:px-7!"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex! max-w-[600px]!
                         flex-col!"
              style={{ rowGap: 4 }}
            >
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={mobileLink}
                >
                  {({ isActive }) => (
                    <>
                      {link.label}

                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="h-2! w-2!
                                     rounded-full!
                                     bg-[#176D5D]!"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* MOBILE AUTH */}
            <div
              className="mx-auto mt-4! flex!
                         max-w-[600px]! flex-col!
                         border-t! border-[#E5EBE7]!
                         pt-4!"
              style={{ rowGap: 12 }}
            >
              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex! justify-center!
                               rounded-xl! border!
                               border-[#DBE6DE]!
                               bg-white! px-5! py-3!
                               text-[15px]! font-semibold!
                               text-[#24352E]! no-underline!"
                  >
                    Log in
                  </NavLink>

                  <NavLink
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className={actionButton}
                  >
                    Get started
                    <span aria-hidden="true">↗</span>
                  </NavLink>
                </>
              ) : (
                <><NotificationBell mobile onClick={() => setMenuOpen(false)} /><NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={actionButton}
                >
                  Dashboard
                  <span aria-hidden="true">↗</span>
                </NavLink></>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
