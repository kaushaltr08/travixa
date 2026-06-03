"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { notifyTravixaAuthChanged } from "@/utils/travixaAuth";
import { Icon } from "@iconify/react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type LoginRequiredModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LoginRequiredModal({
  isOpen,
  title = "Login required",
  message = "Please sign in to continue with Travixa.",
  onClose,
  onSuccess,
}: LoginRequiredModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) {
    return null;
  }

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "user" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to sign in.");
      }

      localStorage.setItem("travixaToken", result.data.token);
      localStorage.setItem("travixaUser", JSON.stringify(result.data.user));
      notifyTravixaAuthChanged();
      toast.success("Login successful");
      setEmail("");
      setPassword("");
      onSuccess();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-zinc-950/70 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={submitLogin}
        className="w-full max-w-md rounded-[1.5rem] bg-white p-5 shadow-2xl dark:bg-zinc-950 sm:rounded-[2rem] sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Travixa account
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-zinc-950 dark:text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-lg text-zinc-950 dark:bg-white/10 dark:text-white"
            aria-label="Close login popup"
          >
            x
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-950 dark:text-white">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 text-base text-zinc-950 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-950 dark:text-white">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 pr-12 text-base text-zinc-950 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:text-white"
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
        </div>

        {status && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">
            {status}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 w-full rounded-full bg-zinc-950 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
        >
          {isSubmitting ? "Signing in..." : "Sign in and continue"}
        </button>
      </form>
    </div>
  );
}
