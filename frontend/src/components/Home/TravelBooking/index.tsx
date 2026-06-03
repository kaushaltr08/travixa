"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { openRazorpayCheckout, type RazorpayOrderResponse } from "@/utils/razorpay";

type TravelModule = {
  label: string;
  slug: string;
  icon?: string;
  kind?: "flight" | "cruise";
};

type BookingForm = {
  customerName: string;
  email: string;
  phone: string;
};

const travelModules: TravelModule[] = [
  { label: "Flights", slug: "flights", kind: "flight" },
  { label: "Hotels", slug: "hotels", icon: "solar:buildings-2-bold-duotone" },
  { label: "Homestays", slug: "homestays", icon: "solar:home-2-bold-duotone" },
  { label: "Holiday Packages", slug: "holiday-packages", icon: "solar:suitcase-tag-bold-duotone" },
  { label: "Trains", slug: "trains", icon: "solar:tram-bold-duotone" },
  { label: "Buses", slug: "buses", icon: "solar:bus-bold-duotone" },
  { label: "Cabs", slug: "cabs", icon: "solar:round-transfer-horizontal-bold-duotone" },
  { label: "Activities", slug: "activities", icon: "solar:map-point-wave-bold-duotone" },
  { label: "Visa", slug: "visa", icon: "solar:passport-bold-duotone" },
  { label: "Forex", slug: "forex", icon: "solar:wallet-money-bold-duotone" },
  { label: "Insurance", slug: "insurance", icon: "solar:shield-check-bold-duotone" },
  { label: "Cruises", slug: "cruises", kind: "cruise" },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const enquiryAmount = 499;

const FlightIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M41.4 8.3c1.8 1.8.2 6.4-3.6 10.2l-4.5 4.5 4.9 16.7-3.3 3.3-8.4-13.4-7.2 7.2.2 5.3-2.5 2.5-3.7-6.8-6.8-3.7 2.5-2.5 5.3.2 7.2-7.2L8.1 16.2l3.3-3.3 16.7 4.9 4.5-4.5c3.8-3.8 8.4-5.4 10.2-3.6Z" fill="currentColor" />
  </svg>
);

const CruiseIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M19 5h13v9h6l3 14H7l4-14h8V5Zm4 5v4h5v-4h-5Z" fill="currentColor" opacity=".85" />
    <path d="M6 31c4 0 4 3 8 3s4-3 8-3 4 3 8 3 4-3 8-3 4 3 8 3v5c-4 0-4-3-8-3s-4 3-8 3-4-3-8-3-4 3-8 3-4-3-8-3v-5Z" fill="currentColor" />
  </svg>
);

const ModuleIcon = ({ item, className }: { item: TravelModule; className: string }) => {
  if (item.kind === "flight") {
    return <FlightIcon className={className} />;
  }

  if (item.kind === "cruise") {
    return <CruiseIcon className={className} />;
  }

  return <Icon icon={item.icon || "solar:ticket-bold-duotone"} className={className} />;
};

const TravelBooking = () => {
  const [activeModule, setActiveModule] = useState("Flights");
  const [openModule, setOpenModule] = useState<TravelModule | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    customerName: "",
    email: "",
    phone: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const openBooking = (item: TravelModule) => {
    setActiveModule(item.label);
    setSubmitStatus("idle");
    setSubmitMessage("");
    setOpenModule(item);
  };

  const isCruise = openModule?.kind === "cruise";
  const isFlight = openModule?.kind === "flight";
  const moduleSlug = openModule?.slug || "flights";

  const bookingDetails = {
    module: moduleSlug,
    from: isCruise ? "Mumbai" : isFlight ? "Delhi" : "Travixa",
    to: isCruise ? "Goa" : isFlight ? "Bengaluru" : openModule?.label || "Service",
    departureDate: "2026-05-29",
    travellers: 1,
    classType: isCruise ? "Ocean View Cabin" : isFlight ? "Economy/Premium Economy" : "Standard",
  };

  const updateBookingForm = (field: keyof BookingForm, value: string) => {
    setBookingForm((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async () => {
    if (!bookingForm.customerName || !bookingForm.email || !bookingForm.phone) {
      setSubmitStatus("error");
      setSubmitMessage("Please enter your name, email, and phone.");
      return;
    }

    try {
      setSubmitStatus("loading");
      setSubmitMessage("");

      const booking = {
        ...bookingDetails,
        ...bookingForm,
      };

      const response = await fetch(`${apiBaseUrl}/api/bookings/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: enquiryAmount, currency: "INR", booking }),
      });

      const result = (await response.json()) as { success: boolean; message?: string; data: RazorpayOrderResponse };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to start payment.");
      }

      await openRazorpayCheckout({
        keyId: result.data.keyId,
        order: result.data.order,
        name: "Travixa",
        description: `${openModule?.label || "Travel"} enquiry`,
        prefill: {
          name: bookingForm.customerName,
          email: bookingForm.email,
          contact: bookingForm.phone,
        },
        notes: {
          bookingId: result.data.bookingId,
          module: moduleSlug,
        },
        theme: { color: "#075BFF" },
        handler: async (paymentResponse) => {
          const verifyResponse = await fetch(`${apiBaseUrl}/api/bookings/razorpay/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: result.data.bookingId,
              ...paymentResponse,
            }),
          });
          const verifyResult = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyResult.success) {
            setSubmitStatus("error");
            setSubmitMessage(verifyResult.message || "Payment verification failed.");
            return;
          }

          setSubmitStatus("success");
          setSubmitMessage("Payment successful. Travixa will contact you soon.");
          setBookingForm({ customerName: "", email: "", phone: "" });
        },
        modal: {
          ondismiss: () => {
            setSubmitStatus("error");
            setSubmitMessage("Payment was cancelled. Your booking is still pending.");
          },
        },
      });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof TypeError
          ? `Cannot connect to backend at ${apiBaseUrl}. Please start the server.`
          : error instanceof Error
          ? error.message
          : "Unable to start payment."
      );
    }
  };

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
                onClick={() => openBooking(item)}
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
                  <ModuleIcon item={item} className="h-8 w-8" />
                </span>
                <span className="text-sm font-semibold leading-5">{item.label}</span>
                {isActive && <span className="absolute bottom-0 h-1 w-10 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {openModule && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close booking popup"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpenModule(null)}
          />

          <div className="relative w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.30)]">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenModule(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-2xl leading-none text-midnight_text transition hover:bg-black/10"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-[#EEF6FF] via-white to-[#F2EEFF] px-5 pb-5 pt-6 sm:px-8">
              <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(34,44,68,0.12)]">
                {travelModules.slice(0, 12).map((item) => {
                  const selected = item.label === openModule.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => openBooking(item)}
                      className={`relative flex min-w-[92px] flex-col items-center gap-1 rounded-xl px-3 py-3 text-xs font-semibold transition ${
                        selected ? "text-primary" : "text-midnight_text hover:bg-slateGray"
                      }`}
                    >
                      <ModuleIcon item={item} className="h-8 w-8" />
                      <span>{item.label}</span>
                      {selected && <span className="absolute bottom-0 h-1 w-10 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 pb-8 pt-5 sm:px-8">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-4 text-sm text-midnight_text">
                  {isCruise ? (
                    <>
                      <label className="flex items-center gap-2">
                        <input type="radio" defaultChecked name="cruiseType" className="h-4 w-4 accent-primary" />
                        Domestic Cruise
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="cruiseType" className="h-4 w-4 accent-primary" />
                        International Cruise
                      </label>
                    </>
                  ) : isFlight ? (
                    <>
                      <label className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                        <input type="radio" defaultChecked name="tripType" className="h-4 w-4 accent-primary" />
                        One Way
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="tripType" className="h-4 w-4 accent-primary" />
                        Round Trip
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="tripType" className="h-4 w-4 accent-primary" />
                        Multi City
                      </label>
                    </>
                  ) : (
                    <label className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                      <input type="radio" defaultChecked name="serviceType" className="h-4 w-4 accent-primary" />
                      {openModule.label} Enquiry
                    </label>
                  )}
                </div>
                <p className="text-sm font-medium text-midnight_text/80">
                  {isCruise
                    ? "Book memorable cruise holidays"
                    : isFlight
                    ? "Book international and domestic flights"
                    : `Send a ${openModule.label.toLowerCase()} request`}
                </p>
              </div>

              <div className="grid overflow-hidden rounded-2xl border border-black/10 lg:grid-cols-5">
                <div className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r">
                  <p className="text-sm text-midnight_text/70">{isCruise ? "Sailing From" : isFlight ? "From" : "Service"}</p>
                  <h3 className="mt-3 text-3xl font-bold text-midnight_text">{isCruise ? "Mumbai" : isFlight ? "Delhi" : openModule.label}</h3>
                  <p className="mt-1 truncate text-sm text-midnight_text/70">{isCruise ? "Mumbai Port, India" : isFlight ? "DEL, Delhi Airport India" : "Travixa travel desk"}</p>
                </div>
                <div className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r">
                  <p className="text-sm text-midnight_text/70">{isCruise ? "Destination" : isFlight ? "To" : "Request"}</p>
                  <h3 className="mt-3 text-3xl font-bold text-midnight_text">{isCruise ? "Goa" : isFlight ? "Bengaluru" : "Custom"}</h3>
                  <p className="mt-1 truncate text-sm text-midnight_text/70">{isCruise ? "Goa Cruise Terminal" : isFlight ? "BLR, Bengaluru International Airport" : "Share your contact details"}</p>
                </div>
                <div className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r">
                  <p className="flex items-center gap-1 text-sm text-midnight_text/70">
                    {isCruise ? "Departure" : "Departure"} <Icon icon="solar:alt-arrow-down-linear" />
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-midnight_text">29 <span className="text-lg font-medium">May&apos;26</span></h3>
                  <p className="mt-1 text-sm text-midnight_text/70">Friday</p>
                </div>
                <div className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r">
                  <p className="flex items-center gap-1 text-sm text-midnight_text/70">
                    {isCruise ? "Nights" : "Return"} <Icon icon="solar:alt-arrow-down-linear" />
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-midnight_text">{isCruise ? "3" : "Tap"}</h3>
                  <p className="mt-1 text-sm text-midnight_text/70">{isCruise ? "Nights onboard" : "Add a return date"}</p>
                </div>
                <div className="p-5">
                  <p className="flex items-center gap-1 text-sm text-midnight_text/70">
                    {isCruise ? "Guests & Cabin" : "Travellers & Class"} <Icon icon="solar:alt-arrow-down-linear" />
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-midnight_text">1 <span className="text-lg font-medium">{isCruise ? "Guest" : "Traveller"}</span></h3>
                  <p className="mt-1 text-sm text-midnight_text/70">{isCruise ? "Ocean View Cabin" : "Economy/Premium Economy"}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-3">
                  {(isCruise
                    ? ["Family", "Couple", "Honeymoon", "Luxury"]
                    : isFlight
                    ? ["Regular", "Student", "Armed Forces", "Senior Citizen"]
                    : ["Individual", "Family", "Business", "Custom"]).map((fare, index) => (
                    <button
                      key={fare}
                      type="button"
                      className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                        index === 0 ? "border-primary bg-primary/10 text-primary" : "border-black/10 text-midnight_text hover:border-primary"
                      }`}
                    >
                      <span className="block font-semibold">{fare}</span>
                      <span className="text-xs text-midnight_text/60">{isCruise ? "Curated deals" : "Extra savings"}</span>
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                  <input
                    type="text"
                    value={bookingForm.customerName}
                    onChange={(event) => updateBookingForm("customerName", event.target.value)}
                    placeholder="Name"
                    className="rounded-xl border border-black/10 px-4 py-3 text-sm text-midnight_text outline-none transition focus:border-primary"
                  />
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(event) => updateBookingForm("email", event.target.value)}
                    placeholder="Email"
                    className="rounded-xl border border-black/10 px-4 py-3 text-sm text-midnight_text outline-none transition focus:border-primary"
                  />
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(event) => updateBookingForm("phone", event.target.value)}
                    placeholder="Phone"
                    className="rounded-xl border border-black/10 px-4 py-3 text-sm text-midnight_text outline-none transition focus:border-primary"
                  />
                  {submitMessage && (
                    <p
                      className={`sm:col-span-3 text-sm font-medium ${
                        submitStatus === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {submitMessage}
                    </p>
                  )}
                  <p className="sm:col-span-3 text-sm font-semibold text-midnight_text/70">
                    Payable now: Rs. {enquiryAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={submitBooking}
                  disabled={submitStatus === "loading"}
                  className="rounded-full bg-gradient-to-r from-[#52B6FF] to-[#075BFF] px-12 py-4 text-xl font-bold uppercase text-white shadow-[0_14px_30px_rgba(7,91,255,0.28)] transition hover:-translate-y-0.5"
                >
                  {submitStatus === "loading" ? "Starting..." : `Pay Rs. ${enquiryAmount}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TravelBooking;
