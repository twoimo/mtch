import { useContext } from "react";
import { ThemeProviderContext } from "../lib/theme-context"; // Updated path to the correct location

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
