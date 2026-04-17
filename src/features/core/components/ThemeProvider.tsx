"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  forcedTheme?: ResolvedTheme;
  storageKey?: string;
};

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_VALUES: ResolvedTheme[] = ["light", "dark"];

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(
  theme: Theme,
  enableSystem: boolean,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  if (theme === "system") {
    return enableSystem ? systemTheme : "light";
  }
  return theme;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  forcedTheme,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return forcedTheme ?? defaultTheme;
    }
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    return forcedTheme ?? stored ?? defaultTheme;
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    typeof window === "undefined" ? "light" : getSystemTheme(),
  );
  const resolvedTheme =
    forcedTheme ?? resolveTheme(theme, enableSystem, systemTheme);

  useEffect(() => {
    if (!forcedTheme) {
      window.localStorage.setItem(storageKey, theme);
    }

    const root = document.documentElement;
    if (attribute === "class") {
      root.classList.remove(...THEME_VALUES);
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }
    root.style.colorScheme = resolvedTheme;
  }, [attribute, forcedTheme, resolvedTheme, storageKey, theme]);

  useEffect(() => {
    if (!enableSystem || forcedTheme || theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setSystemTheme(getSystemTheme());
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [enableSystem, forcedTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: forcedTheme ?? theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        if (forcedTheme) {
          return;
        }
        setThemeState(nextTheme);
      },
    }),
    [forcedTheme, resolvedTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
