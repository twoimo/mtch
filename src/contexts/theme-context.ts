
import { createContext } from "react";
import { Theme, ThemeProviderState } from "@/types/theme";

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
