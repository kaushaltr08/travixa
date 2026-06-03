"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import { notifyTravixaAuthChanged } from "@/utils/travixaAuth";
import { Icon } from "@iconify/react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type SignUpProps = {
  isModal?: boolean;
  onSignIn?: () => void;
};

const SignUp = ({ isModal = false, onSignIn }: SignUpProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "user" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create account.");
      }

      localStorage.setItem("travixaToken", result.data.token);
      localStorage.setItem("travixaUser", JSON.stringify(result.data.user));
      notifyTravixaAuthChanged();
      toast.success("Successfully registered");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`text-zinc-950 dark:text-white ${
        isModal ? "w-full bg-transparent p-0" : "min-h-screen bg-[#f7f7f2] px-4 py-28 dark:bg-zinc-950 sm:px-6"
      }`}
    >
      <div className={`mx-auto grid w-full overflow-hidden bg-white dark:bg-white/5 ${
        isModal
          ? "max-w-5xl rounded-[1.5rem] md:grid-cols-[1.05fr_0.95fr]"
          : "max-w-5xl rounded-[2rem] border border-zinc-950/10 shadow-2xl dark:border-white/10 lg:grid-cols-[1.05fr_0.95fr]"
      }`}>
        <div className={`bg-[linear-gradient(135deg,#0f172a,#0f766e)] p-6 text-white sm:p-8 lg:p-10 ${
          isModal ? "min-h-[220px] md:min-h-[580px]" : "min-h-[220px] lg:min-h-[660px]"
        }`}>
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
                Join Travixa
              </p>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight sm:text-4xl">
                Start saving smarter India travel plans.
              </h2>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm leading-6 text-white/80">
                Create an account to save bookings, destinations, and generated itineraries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
            Travixa Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
            Use your name, email, and password to get started.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Name</span>
              <input
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                required
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  required
                  minLength={6}
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon icon={showPassword ? "tabler:eye-off" : "tabler:eye"} className="text-xl" />
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
            >
              Sign Up {loading && <Loader />}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
            Already have an account?
            {isModal && onSignIn ? (
              <button
                type="button"
                onClick={onSignIn}
                className="pl-2 font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Sign In
              </button>
            ) : (
              <Link href="/signin" className="pl-2 font-semibold text-teal-700 hover:underline dark:text-teal-300">
                Sign In
              </Link>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
