"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FormEvent, useState } from "react";
import Loader from "@/components/Common/Loader";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SignUp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role: "customer" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create account.");
      }

      localStorage.setItem("travixaToken", result.data.token);
      localStorage.setItem("travixaUser", JSON.stringify(result.data.user));
      toast.success("Successfully registered");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#f6f8fb] px-4 py-16 dark:bg-darkmode">
      <div className="mx-auto grid min-h-[660px] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.9fr_1fr]">
        <div className="hidden bg-[linear-gradient(135deg,#111827,#1a21bc_55%,#00a6a6)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Create your Travixa account</h2>
            <p className="mt-4 text-white/80">
              Save your contact details and send travel requests straight to our team.
            </p>
          </div>
          <div className="rounded-2xl bg-white/12 p-5 backdrop-blur">
            <p className="text-sm text-white/80">Customer access</p>
            <p className="mt-2 text-2xl font-semibold">Your bookings will reach MongoDB instantly</p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mb-8">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Join Travixa
            </span>
            <h1 className="mt-3 text-3xl font-bold text-midnight_text sm:text-4xl">
              Sign up
            </h1>
            <p className="mt-3 text-base text-midnight_text/70">
              Create a customer account with your name, email, and password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-midnight_text">
                Name
              </span>
              <input
                type="text"
                placeholder="Your full name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-base text-midnight_text outline-none transition placeholder:text-midnight_text/40 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-midnight_text">
                Email
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-base text-midnight_text outline-none transition placeholder:text-midnight_text/40 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-midnight_text">
                Password
              </span>
              <input
                type="password"
                placeholder="At least 6 characters"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-base text-midnight_text outline-none transition placeholder:text-midnight_text/40 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Sign Up {loading && <Loader />}
            </button>
          </form>

          <p className="mt-6 text-sm text-midnight_text/70">
            Already have an account?
            <Link href="/signin" className="pl-2 font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
