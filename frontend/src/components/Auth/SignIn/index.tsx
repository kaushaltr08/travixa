"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Signin = () => {
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    checkboxToggle: false,
  });
  const [loading, setLoading] = useState(false);

  const loginUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          role: "customer",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to sign in.");
      }

      localStorage.setItem("travixaToken", result.data.token);
      localStorage.setItem("travixaUser", JSON.stringify(result.data.user));
      toast.success("Login successful");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#f6f8fb] px-4 py-16 dark:bg-darkmode">
      <div className="mx-auto grid min-h-[620px] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mb-8">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Travixa Account
            </span>
            <h1 className="mt-3 text-3xl font-bold text-midnight_text sm:text-4xl">
              Sign in to continue
            </h1>
            <p className="mt-3 text-base text-midnight_text/70">
              Access your Travixa bookings and travel requests.
            </p>
          </div>

          <form onSubmit={loginUser} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-midnight_text">
                Email
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={loginData.email}
                required
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                className="h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-base text-midnight_text outline-none transition placeholder:text-midnight_text/40 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-midnight_text">
                Password
              </span>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                required
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-base text-midnight_text outline-none transition placeholder:text-midnight_text/40 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Sign In {loading && <Loader />}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-sm text-midnight_text/70 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Forgot Password?
            </Link>
            <p>
              New to Travixa?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden bg-[linear-gradient(135deg,#0b1b4d,#1a21bc_55%,#3fb9ff)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Plan faster. Travel better.</h2>
            <p className="mt-4 text-white/80">
              Keep your booking requests, follow-ups, and travel details in one place.
            </p>
          </div>
          <div className="rounded-2xl bg-white/12 p-5 backdrop-blur">
            <p className="text-sm text-white/80">Secure login for Travixa customers</p>
            <p className="mt-2 text-2xl font-semibold">Flights, cruises, hotels and more</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
