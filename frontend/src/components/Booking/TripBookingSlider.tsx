"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import LoginRequiredModal from "@/components/Auth/LoginRequiredModal";
import type { Destination } from "@/types/travixa";
import { openRazorpayCheckout, type RazorpayOrderResponse } from "@/utils/razorpay";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TripBookingSliderProps = {
  destinations: Destination[];
};

type BookingForm = {
  customerName: string;
  email: string;
  phone: string;
  from: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
  notes: string;
};

const defaultForm: BookingForm = {
  customerName: "",
  email: "",
  phone: "",
  from: "",
  departureDate: "",
  returnDate: "",
  travellers: 2,
  notes: "",
};

const tripTestPackageAmount = 1;

export default function TripBookingSlider({ destinations }: TripBookingSliderProps) {
  const slides = useMemo(() => destinations.slice(0, 6), [destinations]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [pendingDestination, setPendingDestination] = useState<Destination | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [form, setForm] = useState<BookingForm>(defaultForm);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeDestination = slides[activeIndex] || slides[0];
  const payableAmount = selectedDestination ? tripTestPackageAmount : 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const openBooking = (destination: Destination) => {
    const token = localStorage.getItem("travixaToken");

    if (!token) {
      setPendingDestination(destination);
      setShowLogin(true);
      return;
    }

    setSelectedDestination(destination);
    setMessage("");
    setForm((current) => ({
      ...current,
      notes: `I want to book a ${destination.name} trip. Budget range: ${destination.budgetRange}.`,
    }));
  };

  const closeBooking = () => {
    setSelectedDestination(null);
    setMessage("");
  };

  const continueAfterLogin = () => {
    setShowLogin(false);
    if (pendingDestination) {
      openBooking(pendingDestination);
      setPendingDestination(null);
    }
  };

  const updateForm = (field: keyof BookingForm, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDestination) {
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      if (!form.customerName.trim() || !form.email.trim() || !form.phone.trim() || !form.from.trim()) {
        throw new Error("Name, email, phone, and from city are required.");
      }

      if (form.phone.replace(/\D/g, "").length < 10) {
        throw new Error("Please enter a valid phone number.");
      }

      if (form.departureDate && form.returnDate && form.returnDate < form.departureDate) {
        throw new Error("Return date cannot be before departure date.");
      }

      const booking = {
        module: "holiday-packages",
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        from: form.from,
        to: selectedDestination.name,
        departureDate: form.departureDate || undefined,
        returnDate: form.returnDate || undefined,
        travellers: Number(form.travellers),
        classType: "Travixa curated trip",
        notes: form.notes,
      };

      const response = await fetch(`${apiBaseUrl}/api/bookings/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("travixaToken") || ""}`,
        },
        body: JSON.stringify({ amount: payableAmount, currency: "INR", booking }),
      });

      const result = (await response.json()) as { success: boolean; message?: string; data: RazorpayOrderResponse };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to start payment.");
      }

      await openRazorpayCheckout({
        keyId: result.data.keyId,
        order: result.data.order,
        name: "Travixa",
        description: `${selectedDestination.name} trip booking`,
        prefill: {
          name: form.customerName,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          bookingId: result.data.bookingId,
          destination: selectedDestination.name,
        },
        theme: { color: "#0f766e" },
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
            setMessage(verifyResult.message || "Payment verification failed.");
            return;
          }

          setMessage("Payment successful. Your booking request is confirmed.");
          setForm(defaultForm);
        },
        modal: {
          ondismiss: () => setMessage("Payment was cancelled. Your booking is still pending."),
        },
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeDestination) {
    return null;
  }

  return (
    <>
      <LoginRequiredModal
        isOpen={showLogin}
        title="Login to book this trip"
        message="Travixa needs your account before saving a booking request."
        onClose={() => setShowLogin(false)}
        onSuccess={continueAfterLogin}
      />

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-screen-xl">
          <div className="overflow-hidden rounded-[2rem] border border-zinc-950/10 bg-white shadow-xl dark:border-white/10 dark:bg-white/5">
            <div className="grid min-h-[520px] lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                  Book a curated trip
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                  {activeDestination.name}, planned around your pace
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                  {activeDestination.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {activeDestination.highlights.slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 dark:bg-teal-400/10 dark:text-teal-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openBooking(activeDestination)}
                    className="rounded-full bg-zinc-950 px-7 py-4 font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-zinc-950"
                  >
                    Book this trip
                  </button>
                  <p className="rounded-full border border-zinc-950/10 px-7 py-4 text-center font-semibold text-zinc-700 dark:border-white/10 dark:text-zinc-200">
                    {activeDestination.budgetRange}
                  </p>
                </div>
                <div className="mt-8 flex gap-2">
                  {slides.map((destination, index) => (
                    <button
                      key={destination.slug}
                      type="button"
                      aria-label={`Show ${destination.name}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeIndex ? "w-10 bg-teal-600" : "w-2.5 bg-zinc-300 dark:bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="relative min-h-[360px]">
                <Image
                  src={activeDestination.coverImage}
                  alt={activeDestination.name}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/30 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute bottom-5 left-5 rounded-2xl bg-white/85 px-5 py-4 shadow-lg backdrop-blur dark:bg-zinc-950/80">
                  <p className="text-sm text-zinc-500 dark:text-zinc-300">Best time</p>
                  <p className="font-semibold">{activeDestination.bestTimeToVisit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedDestination && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-zinc-950/65 px-4 backdrop-blur-sm">
          <form
            onSubmit={submitBooking}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-zinc-950 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                  Trip booking request
                </p>
                <h3 className="mt-2 text-3xl font-semibold">{selectedDestination.name}</h3>
              </div>
              <button
                type="button"
                onClick={closeBooking}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-xl dark:bg-white/10"
                aria-label="Close booking popup"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold">Name</span>
                <input required className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" value={form.customerName} onChange={(event) => updateForm("customerName", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Email</span>
                <input required type="email" className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Phone</span>
                <input required className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">From city</span>
                <input required className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" value={form.from} onChange={(event) => updateForm("from", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Departure</span>
                <input type="date" className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" value={form.departureDate} onChange={(event) => updateForm("departureDate", event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Return</span>
                <input type="date" className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" value={form.returnDate} onChange={(event) => updateForm("returnDate", event.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Travellers</span>
                <input type="number" min={1} className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 dark:border-white/10" value={form.travellers} onChange={(event) => updateForm("travellers", Number(event.target.value))} />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Notes</span>
                <textarea rows={4} className="w-full resize-none rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 dark:border-white/10" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} />
              </label>
            </div>

            {message && (
              <p className="mt-5 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
                {message}
              </p>
            )}

            {payableAmount > 0 && (
              <p className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                Payable now: Rs. {payableAmount.toLocaleString("en-IN")}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 h-12 w-full rounded-full bg-zinc-950 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
            >
              {isSubmitting ? "Starting payment..." : `Pay Rs. ${payableAmount.toLocaleString("en-IN")}`}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
