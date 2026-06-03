"use client";

export const travixaAuthChangedEvent = "travixa-auth-changed";

export type TravixaUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export const getStoredTravixaUser = (): TravixaUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("travixaToken");
  const storedUser = localStorage.getItem("travixaUser");

  if (!token || !storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as TravixaUser;
  } catch {
    localStorage.removeItem("travixaUser");
    return null;
  }
};

export const notifyTravixaAuthChanged = () => {
  window.dispatchEvent(new Event(travixaAuthChangedEvent));
};

export const clearTravixaAuth = () => {
  localStorage.removeItem("travixaToken");
  localStorage.removeItem("travixaUser");
  notifyTravixaAuthChanged();
};
