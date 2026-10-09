
import React from "react";

export default function SectionDivider({ number, label }) {
  return (
    <div
      className="group relative! w-full! bg-[#FCFDFB]!"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="mx-auto! flex! w-full! max-w-[1440px]!
                   items-center! gap-4! px-5! py-6!
                   sm:gap-6! sm:px-8!
                   lg:px-12! xl:px-16!"
      >
        {/* Left line */}
        <span
          aria-hidden="true"
          className="h-[1.5px]! min-w-0! flex-1!
                     bg-[#D7E4DA]!
                     transition-colors! duration-300!
                     group-hover:bg-[#8FBE9E]!"
        />

        {/* Section label */}
        <div
          className="inline-flex! shrink-0! items-center!
                     gap-3! rounded-full! border!
                     border-[#D4E5D9]! bg-white!
                     px-5! py-3!
                     shadow-[0_2px_8px_rgba(30,80,45,0.03)]!
                     transition-all! duration-300!
                     ease-out!
                     group-hover:-translate-y-0.5!
                     group-hover:border-[#9FC9AC]!
                     group-hover:bg-[#EAF4ED]!
                     group-hover:shadow-[0_8px_22px_rgba(25,95,55,0.10)]!"
        >
          {/* Section number */}
          <span
            className="text-[12px]! font-bold!
                       tracking-[0.08em]!
                       text-[#176D5D]!
                       transition-colors! duration-300!
                       sm:text-[13px]!"
          >
            {number}
          </span>

          {/* Decorative dot */}
          <span
            aria-hidden="true"
            className="h-[5px]! w-[5px]!
                       rounded-full! bg-[#87B999]!
                       transition-all! duration-300!
                       group-hover:scale-125!
                       group-hover:bg-[#176D5D]!"
          />

          {/* Section name */}
          <span
            className="text-[12px]! font-bold!
                       tracking-[0.18em]!
                       text-[#425E4B]! uppercase!
                       transition-colors! duration-300!
                       group-hover:text-[#176D5D]!
                       sm:text-[13px]!"
          >
            {label}
          </span>
        </div>

        {/* Right line */}
        <span
          aria-hidden="true"
          className="h-[1.5px]! min-w-0! flex-1!
                     bg-[#D7E4DA]!
                     transition-colors! duration-300!
                     group-hover:bg-[#8FBE9E]!"
        />
      </div>
    </div>
  );
}
