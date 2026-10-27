"use client";
// Tiny external store for language + theme. The <html> element is the source of truth
// (set before first paint by the inline script in app/layout.js), so there is no flash.
import { useSyncExternalStore } from "react";

const subs = new Set();
const notify = () => subs.forEach((f) => f());
const subscribe = (f) => (subs.add(f), () => subs.delete(f));
const save = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable: ignore */
  }
};

export const useLang = () =>
  useSyncExternalStore(subscribe, () => (document.documentElement.lang === "en" ? "en" : "bn"), () => "bn");
export const useTheme = () =>
  useSyncExternalStore(subscribe, () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"), () => "light");

export function toggleLang() {
  const next = document.documentElement.lang === "en" ? "bn" : "en";
  document.documentElement.lang = next;
  save("noor-lang", next);
  notify();
}
export function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  save("noor-theme", next);
  notify();
}
