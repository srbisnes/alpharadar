"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserProfile {
  nickname: string;
  email?: string;
  wallet?: string;
  registeredAt: string;
  bio?: string;
}

const PROFILE_KEY = "alpharadar_profile";
const FAVORITES_KEY = "alpharadar_favorites";

export function useUser() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setProfile(JSON.parse(p));
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch {}
    setLoaded(true);
  }, []);

  const register = useCallback((data: Omit<UserProfile, "registeredAt">) => {
    const newProfile: UserProfile = {
      ...data,
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
    return newProfile;
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return {
    profile,
    favorites,
    loaded,
    isRegistered: !!profile,
    register,
    updateProfile,
    logout,
    toggleFavorite,
    isFavorite,
  };
}
