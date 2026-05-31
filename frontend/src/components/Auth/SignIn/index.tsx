"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type SigninProps = {
  isModal?: boolean;
};

const Signin = ({ isModal = false }: SigninProps) => {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const loginUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginData, role: "user" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to sign in.");
      }

      localStorage.setItem("travixaToken", result.data.token);
      localStorage.setItem("travixaUser", JSON.stringify(result.data.user));
      toast.success("Login successful");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
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
          ? "max-w-5xl rounded-[1.5rem] md:grid-cols-[0.95fr_1.05fr]"
          : "max-w-5xl rounded-[2rem] border border-zinc-950/10 shadow-2xl dark:border-white/10 lg:grid-cols-[0.95fr_1.05fr]"
      }`}>
        <div className="order-2 flex flex-col justify-center p-6 sm:p-8 lg:order-1 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
            Travixa Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Sign in to continue
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
            Access your bookings, saved destinations, and generated trip previews.
          </p>

          <form onSubmit={loginUser} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={loginData.email}
                required
                onChange={(event) => setLoginData({ ...loginData, email: event.target.value })}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                required
                onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
            >
              Sign In {loading && <Loader />}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/forgot-password" className="font-semibold text-teal-700 hover:underline dark:text-teal-300">
              Forgot Password?
            </Link>
            <p>
              New to Travixa?{" "}
              <Link href="/signup" className="font-semibold text-teal-700 hover:underline dark:text-teal-300">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className={`order-1 bg-[linear-gradient(135deg,#0f766e,#0f172a)] p-6 text-white sm:p-8 lg:order-2 lg:p-10 ${
          isModal ? "min-h-[220px] md:min-h-[560px]" : "min-h-[220px] lg:min-h-[620px]"
        }`}>
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
                Travel intelligence
              </p>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight sm:text-4xl">
                Your trips, requests, and saved ideas in one place.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {["Book curated trips", "Save destinations", "Generate previews"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
