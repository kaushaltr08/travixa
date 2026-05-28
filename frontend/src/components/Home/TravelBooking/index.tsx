"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";

const travelModules = [
  { label: "Flights", icon: "solar:plane-bold-duotone" },
  { label: "Hotels", icon: "solar:buildings-2-bold-duotone" },
  { label: "Homestays", icon: "solar:home-2-bold-duotone" },
  { label: "Holiday Packages", icon: "solar:suitcase-tag-bold-duotone" },
  { label: "Trains", icon: "solar:tram-bold-duotone" },
  { label: "Buses", icon: "solar:bus-bold-duotone" },
  { label: "Cabs", icon: "solar:round-transfer-horizontal-bold-duotone" },
  { label: "Activities", icon: "solar:map-point-wave-bold-duotone" },
  { label: "Visa", icon: "solar:passport-bold-duotone" },
  { label: "Forex", icon: "solar:wallet-money-bold-duotone" },
  { label: "Insurance", icon: "solar:shield-check-bold-duotone" },
  { label: "Cruises", icon: "solar:ship-bold-duotone" },
];

const TravelBooking = () => {
  const [activeModule, setActiveModule] = useState("Flights");

  return (
    <section id="services" className="relative z-10 -mb-16 mt-12 py-0">
      <div className="rounded-2xl bg-white p-3 shadow-[0_24px_70px_rgba(34,44,68,0.14)] ring-1 ring-black/5">
        <div className="flex gap-3 overflow-x-auto scroll-smooth pb-2 lg:grid lg:grid-cols-12 lg:overflow-visible lg:pb-0">
          {travelModules.map((item) => {
            const isActive = activeModule === item.label;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveModule(item.label)}
                className={`group relative flex min-h-[104px] min-w-[118px] flex-col items-center justify-center gap-2 rounded-xl px-3 py-3 text-center transition duration-300 hover:-translate-y-1 lg:min-w-0 ${
                  isActive
                    ? "bg-primary text-white shadow-[0_14px_35px_rgba(101,86,255,0.28)]"
                    : "text-midnight_text hover:bg-slateGray hover:text-primary hover:shadow-[0_14px_35px_rgba(34,44,68,0.10)]"
                }`}
                aria-pressed={isActive}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition duration-300 ${
                    isActive ? "bg-white/20" : "bg-primary/10 group-hover:bg-white"
                  }`}
                >
                  <Icon icon={item.icon} className="text-3xl" />
                </span>
                <span className="text-sm font-semibold leading-5">{item.label}</span>
                {isActive && <span className="absolute bottom-0 h-1 w-10 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TravelBooking;
