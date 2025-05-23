import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Create a simple context for theme
type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => null,
});

// Simple props type that doesn't try to match next-themes exactly
type ThemeProviderProps = {
  children: React.ReactNode;
  [key: string]: any; // Allow any additional props to be passed through
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Client-side only code
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a simple wrapper when not mounted to avoid hydration issues
    return <div className="theme-provider-loading">{children}</div>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const useTheme = () => {
  return useContext(ThemeContext);
};
