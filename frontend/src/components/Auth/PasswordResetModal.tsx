"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import Loader from "@/components/Common/Loader";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type PasswordResetModalProps = {
  onBackToSignIn: () => void;
};

export default function PasswordResetModal({ onBackToSignIn }: PasswordResetModalProps) {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to verify email.");
      }

      setEmail(result.data?.email || email);
      setStep("reset");
      toast.success("Email verified. Set your new password.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify email.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwords.newPassword }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to reset password.");
      }

      toast.success(result.message || "Password reset successfully.");
      onBackToSignIn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    name: "newPassword" | "confirmPassword",
    label: string,
    visible: boolean,
    toggleVisible: () => void
  ) => (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={passwords[name]}
          required
          minLength={6}
          onChange={(event) => setPasswords({ ...passwords, [name]: event.target.value })}
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
        />
        <button
          type="button"
          onClick={toggleVisible}
          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <Icon icon={visible ? "tabler:eye-off" : "tabler:eye"} className="text-xl" />
        </button>
      </div>
    </label>
  );

  return (
    <section className="w-full bg-transparent p-0 text-zinc-950 dark:text-white">
      <div className="mx-auto grid w-full max-w-3xl overflow-hidden rounded-[1.5rem] bg-white dark:bg-white/5">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
            Travixa Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            {step === "email" ? "Reset your password" : "Create new password"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {step === "email"
              ? "Enter your account email to continue."
              : `Updating password for ${email}.`}
          </p>

          {step === "email" ? (
            <form onSubmit={requestReset} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Email address</span>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
              >
                Reset Password {loading && <Loader />}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="mt-8 space-y-5">
              {renderPasswordInput("newPassword", "New password", showNewPassword, () =>
                setShowNewPassword((current) => !current)
              )}
              {renderPasswordInput("confirmPassword", "Confirm password", showConfirmPassword, () =>
                setShowConfirmPassword((current) => !current)
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
              >
                Save Password {loading && <Loader />}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={onBackToSignIn}
            className="mt-6 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </section>
  );
}
