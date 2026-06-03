"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import LoginRequiredModal from "@/components/Auth/LoginRequiredModal";
import { destinations, travelStyles } from "@/lib/travixa-data";
import { openRazorpayCheckout, type RazorpayOrderResponse } from "@/utils/razorpay";

type HotelCategory = "Budget" | "Best Value" | "Premium";
type TransportMode = "Own Car" | "Rental Car" | "Taxi" | "Bus" | "Train" | "Flight";

type Hotel = {
  id: string;
  name: string;
  category: HotelCategory;
  area: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
};

type RouteOption = {
  id: string;
  provider: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
};

type ItineraryDay = {
  day: number;
  title: string;
  departureTime: string;
  places: {
    name: string;
    duration: string;
    travelTime: string;
    arrivalTime: string;
  }[];
  returnTime: string;
};

type BookingForm = {
  fullName: string;
  email: string;
  whatsapp: string;
};

type PaidInvoice = {
  bookingId: string;
  invoiceId: string;
  paymentId: string;
  destination: string;
  hotelName: string;
  transportMode: TransportMode;
  plannedTotal: number;
  paidAmount: number;
  travelers: number;
  dates: string;
};

type PlaceSuggestion = {
  name: string;
  state: string;
  type: string;
  source: "fallback";
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const tripPlannerTestAmount = 1;

const fallbackSuggestions: PlaceSuggestion[] = [
  ...destinations.map((item) => ({
    name: item.name,
    state: item.state,
    type: "Destination",
    source: "fallback" as const,
  })),
  { name: "Delhi", state: "Delhi", type: "City", source: "fallback" },
  { name: "Mumbai", state: "Maharashtra", type: "City", source: "fallback" },
  { name: "Bengaluru", state: "Karnataka", type: "City", source: "fallback" },
  { name: "Agra", state: "Uttar Pradesh", type: "Tourist Destination", source: "fallback" },
  { name: "Varanasi", state: "Uttar Pradesh", type: "Tourist Destination", source: "fallback" },
  { name: "Mysuru", state: "Karnataka", type: "Tourist Destination", source: "fallback" },
  { name: "Pondicherry", state: "Puducherry", type: "Tourist Destination", source: "fallback" },
  { name: "Darjeeling", state: "West Bengal", type: "Tourist Destination", source: "fallback" },
  { name: "Shillong", state: "Meghalaya", type: "Tourist Destination", source: "fallback" },
  { name: "Hampi", state: "Karnataka", type: "Tourist Destination", source: "fallback" },
];

const transportModes: TransportMode[] = [
  "Own Car",
  "Rental Car",
  "Taxi",
  "Bus",
  "Train",
  "Flight",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return "Select date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getTripDays = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 1;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

  return Math.max(1, difference);
};

const buildHotels = (destinationName: string): Hotel[] => {
  const slug = destinationName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return [
    {
      id: `${slug}-budget`,
      name: `${destinationName} Comfort Inn`,
      category: "Budget",
      area: "Central Market Area",
      pricePerNight: 2800,
      rating: 4.1,
      amenities: ["Breakfast", "Wi-Fi", "Local support"],
    },
    {
      id: `${slug}-value`,
      name: `${destinationName} Vista Retreat`,
      category: "Best Value",
      area: "Near main attractions",
      pricePerNight: 5200,
      rating: 4.5,
      amenities: ["Breakfast", "Pool", "Airport pickup", "Travel desk"],
    },
    {
      id: `${slug}-premium`,
      name: `${destinationName} Grand Heritage`,
      category: "Premium",
      area: "Premium hotel district",
      pricePerNight: 9800,
      rating: 4.8,
      amenities: ["Spa", "Fine dining", "Private transfer", "Concierge"],
    },
  ];
};

const buildRoutes = (destinationName: string, mode: "Train" | "Flight"): RouteOption[] => {
  const basePrice = mode === "Flight" ? 6400 : 1450;
  return [
    {
      id: `${mode}-morning`,
      provider: mode === "Flight" ? "IndiGo 6E 412" : "Vande Bharat Express",
      from: "Delhi",
      to: destinationName,
      departure: "07:20",
      arrival: mode === "Flight" ? "09:35" : "15:10",
      price: basePrice,
    },
    {
      id: `${mode}-evening`,
      provider: mode === "Flight" ? "Air India AI 867" : "Rajdhani Link",
      from: "Delhi",
      to: destinationName,
      departure: "18:10",
      arrival: mode === "Flight" ? "20:25" : "06:35",
      price: basePrice + 900,
    },
  ];
};

const buildItinerary = (
  destinationName: string,
  days: number,
  hotelArea: string
): ItineraryDay[] => {
  const destination =
    destinations.find((item) => item.name.toLowerCase() === destinationName.toLowerCase()) ||
    destinations[0];
  const places = [...destination.attractions, ...destination.hiddenGems, ...destination.localExperiences];

  return Array.from({ length: Math.min(days, 10) }, (_, index) => {
    const first = places[index % places.length];
    const second = places[(index + 2) % places.length];

    return {
      day: index + 1,
      title: index === 0 ? `Arrival and ${destination.name} orientation` : `${destination.name} curated route`,
      departureTime: index === 0 ? "11:00 AM" : "09:00 AM",
      places: [
        {
          name: first,
          duration: "2 hr",
          travelTime: `25 min from ${hotelArea}`,
          arrivalTime: index === 0 ? "11:25 AM" : "09:25 AM",
        },
        {
          name: second,
          duration: "2.5 hr",
          travelTime: "35 min",
          arrivalTime: index === 0 ? "02:30 PM" : "01:15 PM",
        },
      ],
      returnTime: index === days - 1 ? "05:30 PM" : "07:00 PM",
    };
  });
};

function StudioFormPage() {
  const searchParams = useSearchParams();
  const styleFromQuery = searchParams.get("style") || travelStyles[0].name;
  const destinationFromQuery =
    destinations.find((item) => item.slug === searchParams.get("destination"))?.name ||
    destinations[0].name;
  const today = new Date();
  const defaultStartDate = today.toISOString().slice(0, 10);
  const defaultEndDate = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10);

  const [destinationQuery, setDestinationQuery] = useState(destinationFromQuery);
  const [selectedDestination, setSelectedDestination] = useState(destinationFromQuery);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [travelStyle, setTravelStyle] = useState(styleFromQuery);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [transportMode, setTransportMode] = useState<TransportMode>("Taxi");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    fullName: "",
    email: "",
    whatsapp: "",
  });
  const [showLogin, setShowLogin] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [invoice, setInvoice] = useState<PaidInvoice | null>(null);

  const tripDays = getTripDays(startDate, endDate);
  const travelers = adults + children;
  const nights = Math.max(1, tripDays - 1);
  const hotels = useMemo(() => buildHotels(selectedDestination), [selectedDestination]);
  const selectedHotel = hotels.find((hotel) => hotel.id === selectedHotelId) || hotels[1];
  const routeOptions = useMemo(
    () => (transportMode === "Train" || transportMode === "Flight" ? buildRoutes(selectedDestination, transportMode) : []),
    [selectedDestination, transportMode]
  );
  const selectedRoute = routeOptions.find((route) => route.id === selectedRouteId) || routeOptions[0];
  const itinerary = useMemo(
    () => buildItinerary(selectedDestination, tripDays, selectedHotel.area),
    [selectedDestination, tripDays, selectedHotel.area]
  );

  const suggestions = useMemo(() => {
    const query = destinationQuery.trim().toLowerCase();
    const pool = fallbackSuggestions;
    if (!query) return pool.slice(0, 6);

    return pool
      .filter((item) =>
        `${item.name} ${item.state} ${item.type}`.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [destinationQuery]);

  const transportCost =
    transportMode === "Own Car"
      ? tripDays * 1200
      : transportMode === "Rental Car"
      ? tripDays * 3200
      : transportMode === "Taxi"
      ? tripDays * 2400
      : transportMode === "Bus"
      ? travelers * 850
      : 0;
  const routeCost = selectedRoute ? selectedRoute.price * travelers : 0;
  const hotelCost = selectedHotel.pricePerNight * nights;
  const activityCost = travelers * tripDays * 900;
  const taxes = Math.round((hotelCost + transportCost + routeCost + activityCost) * 0.05);
  const grandTotal = hotelCost + transportCost + routeCost + activityCost + taxes;

  const chooseDestination = (name: string) => {
    setSelectedDestination(name);
    setDestinationQuery(name);
    setSelectedHotelId("");
    setSelectedRouteId("");
  };

  const updateBookingForm = (field: keyof BookingForm, value: string) => {
    setBookingForm((current) => ({ ...current, [field]: value }));
  };

  const handleDestinationInput = (value: string) => {
    setDestinationQuery(value);
    const matchedFallback = fallbackSuggestions.find((item) => item.name.toLowerCase() === value.toLowerCase());
    if (matchedFallback) {
      setSelectedDestination(matchedFallback.name);
      setSelectedHotelId("");
      setSelectedRouteId("");
    }
  };

  const saveTripRequest = async () => {
    const storedUser = localStorage.getItem("travixaUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user?.id) {
      throw new Error("Please login before booking your trip.");
    }

    const response = await fetch(`${apiBaseUrl}/api/trip-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("travixaToken") || ""}`,
      },
      body: JSON.stringify({
        userId: user.id,
        destination: selectedDestination,
        budget: grandTotal,
        days: tripDays,
        travelStyle,
        season: "Dynamic dates",
        travelPartner: travelers > 2 ? "Family" : "Couple",
      }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to save trip request.");
    }
  };

  const bookTrip = async () => {
    setMessage("");
    setInvoice(null);

    if (!bookingForm.fullName.trim() || !bookingForm.email.trim() || !bookingForm.whatsapp.trim()) {
      setMessage("Please enter full name, email, and WhatsApp number before booking.");
      return;
    }

    if (!/^\d{10}$/.test(bookingForm.whatsapp.trim())) {
      setMessage("Please enter a valid 10 digit WhatsApp number.");
      return;
    }

    if (!localStorage.getItem("travixaToken")) {
      setShowLogin(true);
      return;
    }

    try {
      setIsSaving(true);

      const booking = {
        module: "holiday-packages",
        customerName: bookingForm.fullName,
        email: bookingForm.email,
        phone: bookingForm.whatsapp,
        from: "Trip Planner",
        to: selectedDestination,
        departureDate: startDate || undefined,
        returnDate: endDate || undefined,
        travellers: travelers,
        classType: `${selectedHotel.category} package with ${transportMode}`,
        notes: [
          `Estimated total: ${formatCurrency(grandTotal)}`,
          `Hotel: ${selectedHotel.name}`,
          `Transport: ${transportMode}`,
          selectedRoute ? `Route: ${selectedRoute.provider}` : "",
          `Travel style: ${travelStyle}`,
        ]
          .filter(Boolean)
          .join(" | "),
      };

      const response = await fetch(`${apiBaseUrl}/api/bookings/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("travixaToken") || ""}`,
        },
        body: JSON.stringify({
          amount: tripPlannerTestAmount,
          currency: "INR",
          booking,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data: RazorpayOrderResponse;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to start payment.");
      }

      await openRazorpayCheckout({
        keyId: result.data.keyId,
        order: result.data.order,
        name: "Travixa",
        description: `${selectedDestination} AI trip planner booking`,
        prefill: {
          name: bookingForm.fullName,
          email: bookingForm.email,
          contact: bookingForm.whatsapp,
        },
        notes: {
          bookingId: result.data.bookingId,
          destination: selectedDestination,
          hotel: selectedHotel.name,
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

          try {
            await saveTripRequest();
          } catch {
            // Booking payment is already verified; keep the success invoice visible.
          }

          setBookingForm({ fullName: "", email: "", whatsapp: "" });
          setInvoice({
            bookingId: String(result.data.bookingId),
            invoiceId: `TRV-${String(result.data.bookingId).slice(-6).toUpperCase()}`,
            paymentId: paymentResponse.razorpay_payment_id,
            destination: selectedDestination,
            hotelName: selectedHotel.name,
            transportMode,
            plannedTotal: grandTotal,
            paidAmount: tripPlannerTestAmount,
            travelers,
            dates: `${formatDate(startDate)} to ${formatDate(endDate)}`,
          });
        },
        modal: {
          ondismiss: () => setMessage("Payment was cancelled. Your trip booking is still pending."),
        },
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="bg-[#f7f7f2] px-4 pb-16 pt-28 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <LoginRequiredModal
        isOpen={showLogin}
        title="Login to book your trip"
        message="Travixa saves your planner, booking, and payment status to your account."
        onClose={() => setShowLogin(false)}
        onSuccess={() => setShowLogin(false)}
      />

      {invoice && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-zinc-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-zinc-950 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                  Payment successful
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Thank you! 🎉✈️</h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  Your Travixa trip is confirmed in test mode. We saved your itinerary so you can
                  review it in My Trips.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInvoice(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-xl dark:bg-white/10"
                aria-label="Close thank you popup"
              >
                x
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 p-5 dark:border-white/10">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Invoice</span>
                <span className="font-semibold">{invoice.invoiceId}</span>
              </div>
              {[
                ["Booking ID", invoice.bookingId],
                ["Payment ID", invoice.paymentId],
                ["Destination", invoice.destination],
                ["Dates", invoice.dates],
                ["Travelers", String(invoice.travelers)],
                ["Hotel", invoice.hotelName],
                ["Transport", invoice.transportMode],
                ["Estimated Trip Total", formatCurrency(invoice.plannedTotal)],
                ["Razorpay Test Paid", formatCurrency(invoice.paidAmount)],
              ].map(([label, value]) => (
                <div key={label} className="mt-3 flex justify-between gap-4 text-sm">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-right font-semibold">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="flex-1 rounded-full bg-zinc-950 px-5 py-3 text-center font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-zinc-950"
              >
                View Trips
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-full border border-zinc-200 px-5 py-3 font-semibold transition hover:border-teal-400 dark:border-white/10"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-screen-xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              AI Trip Planner
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold sm:text-6xl">
              Build your India trip from stay to payment
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              Search a destination, compare hotel categories, generate a day-wise route,
              choose transport, and review the total before booking.
            </p>

            <div className="mt-8 rounded-2xl border border-zinc-950/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-zinc-500">Selected plan</p>
              <h2 className="mt-2 text-2xl font-semibold">{selectedDestination}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                <span>{formatDate(startDate)}</span>
                <span>{formatDate(endDate)}</span>
                <span>{tripDays} days</span>
                <span>{travelers} travelers</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Search destination in India</h2>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Auto suggestions
                </span>
              </div>
              <div className="mt-4">
                <input
                  value={destinationQuery}
                  onChange={(event) => handleDestinationInput(event.target.value)}
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 outline-none transition focus:border-teal-500 dark:border-white/10"
                  placeholder="Search city, state, or tourist destination"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Search suggestions are powered by the built-in destination list.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {suggestions.map((item) => (
                    <button
                      key={`${item.name}-${item.state}-${item.type}`}
                      type="button"
                      onClick={() => chooseDestination(item.name)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        selectedDestination === item.name
                          ? "border-teal-500 bg-teal-50 text-teal-900"
                          : "border-zinc-200 bg-white hover:border-teal-300 dark:border-white/10 dark:bg-white/5"
                      }`}
                    >
                      <span className="block font-semibold">{item.name}</span>
                      <span className="text-sm text-zinc-500">
                        {item.state} - {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                Step 2
              </p>
              <h2 className="mt-1 text-xl font-semibold">Select dates and travelers</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Adults</span>
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(event) => setAdults(Math.max(1, Number(event.target.value)))}
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Children</span>
                  <input
                    type="number"
                    min={0}
                    value={children}
                    onChange={(event) => setChildren(Math.max(0, Number(event.target.value)))}
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
                  />
                </label>
              </div>
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                Steps 3 and 4
              </p>
              <h2 className="mt-1 text-xl font-semibold">Hotel recommendations</h2>
            </div>
            <label className="sm:w-64">
              <span className="mb-2 block text-sm font-semibold">Travel Style</span>
              <select
                value={travelStyle}
                onChange={(event) => setTravelStyle(event.target.value)}
                className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
              >
                {travelStyles.map((style) => (
                  <option key={style.name}>{style.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <button
                key={hotel.id}
                type="button"
                onClick={() => setSelectedHotelId(hotel.id)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedHotel.id === hotel.id
                    ? "border-teal-500 bg-teal-50 text-teal-950"
                    : "border-zinc-200 bg-white hover:border-teal-300 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white">
                  {hotel.category}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{hotel.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{hotel.area}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-semibold">{formatCurrency(hotel.pricePerNight)}</span>
                  <span className="text-sm font-semibold">Rating {hotel.rating}</span>
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {hotel.amenities.join(", ")}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
              Steps 5 and 6
            </p>
            <h2 className="mt-1 text-xl font-semibold">AI day-wise itinerary</h2>
            <div className="mt-5 space-y-4">
              {itinerary.map((day) => (
                <div key={day.day} className="rounded-xl border border-zinc-200 p-4 dark:border-white/10">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-teal-700">Day {day.day}</p>
                      <h3 className="text-lg font-semibold">{day.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Depart {day.departureTime} - Return {day.returnTime}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {day.places.map((place) => (
                      <div key={place.name} className="rounded-xl bg-zinc-50 p-4 dark:bg-white/5">
                        <p className="font-semibold">{place.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          Arrive {place.arrivalTime} - Visit {place.duration}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">Travel time: {place.travelTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                Steps 7 and 8
              </p>
              <h2 className="mt-1 text-xl font-semibold">Transportation</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {transportModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setTransportMode(mode);
                      setSelectedRouteId("");
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      transportMode === mode
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : "border-zinc-200 hover:border-teal-300 dark:border-white/10"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {routeOptions.length > 0 && (
                <div className="mt-4 space-y-3">
                  {routeOptions.map((route) => (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedRoute?.id === route.id
                          ? "border-teal-500 bg-teal-50 text-teal-950"
                          : "border-zinc-200 hover:border-teal-300 dark:border-white/10"
                      }`}
                    >
                      <span className="block font-semibold">{route.provider}</span>
                      <span className="text-sm text-zinc-500">
                        {route.from} to {route.to} - {route.departure} to {route.arrival}
                      </span>
                      <span className="mt-2 block font-semibold">
                        {formatCurrency(route.price)} per person
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                Step 9
              </p>
              <h2 className="mt-1 text-xl font-semibold">Cost calculation</h2>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  ["Hotel Cost", hotelCost],
                  ["Transport Cost", transportCost],
                  ["Flight/Train Cost", routeCost],
                  ["Activity Cost", activityCost],
                  ["Taxes", taxes],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between">
                    <span className="text-zinc-500">{label as string}</span>
                    <span className="font-semibold">{formatCurrency(value as number)}</span>
                  </div>
                ))}
                <div className="border-t border-zinc-200 pt-3 text-lg font-semibold dark:border-white/10">
                  <div className="flex justify-between">
                    <span>Grand Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
              Step 10
            </p>
            <h2 className="mt-1 text-xl font-semibold">Trip summary</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-white/5">
                <p className="text-sm text-zinc-500">Hotel</p>
                <p className="mt-1 font-semibold">{selectedHotel.name}</p>
                <p className="text-sm text-zinc-500">{selectedHotel.category} - {selectedHotel.area}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-white/5">
                <p className="text-sm text-zinc-500">Transport</p>
                <p className="mt-1 font-semibold">{transportMode}</p>
                <p className="text-sm text-zinc-500">
                  {selectedRoute ? selectedRoute.provider : "Local route optimized"}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {itinerary.map((day) => (
                <div key={day.day} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
                    {day.day}
                  </span>
                  <div>
                    <p className="font-semibold">{day.title}</p>
                    <p className="text-sm text-zinc-500">
                      {day.places.map((place) => place.name).join(" - ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
              Steps 11 to 13
            </p>
            <h2 className="mt-1 text-xl font-semibold">Book trip</h2>
            <div className="mt-4 space-y-4">
              <label>
                <span className="mb-2 block text-sm font-semibold">Full Name</span>
                <input
                  required
                  value={bookingForm.fullName}
                  onChange={(event) => updateBookingForm("fullName", event.target.value)}
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Email Address</span>
                <input
                  required
                  type="email"
                  value={bookingForm.email}
                  onChange={(event) => updateBookingForm("email", event.target.value)}
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">WhatsApp Number</span>
                <input
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={bookingForm.whatsapp}
                  onChange={(event) =>
                    updateBookingForm("whatsapp", event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-4 dark:border-white/10"
                />
              </label>
            </div>
            {message && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">
                {message}
              </p>
            )}
            <p className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
              Razorpay test payment now: {formatCurrency(tripPlannerTestAmount)}. Estimated trip
              invoice total: {formatCurrency(grandTotal)}.
            </p>
            <button
              type="button"
              onClick={bookTrip}
              disabled={isSaving}
              className="mt-5 h-12 w-full rounded-full bg-zinc-950 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
            >
              {isSaving ? "Starting payment..." : `Pay Test Amount - ${formatCurrency(tripPlannerTestAmount)}`}
            </button>
            <Link href="/dashboard" className="mt-4 block text-center text-sm font-semibold text-teal-700 dark:text-teal-300">
              View My Trips
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-[#f7f7f2] px-4 pb-20 pt-32 text-zinc-950 dark:bg-zinc-950 dark:text-white">
          <section className="mx-auto max-w-screen-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Loading trip planner
            </p>
          </section>
        </main>
      }
    >
      <StudioFormPage />
    </Suspense>
  );
}
