export type MobileThemeMode = "light" | "dark";

const STORAGE_KEY = "paypay-mobile-theme";

const isThemeMode = (value: string | null): value is MobileThemeMode => value === "light" || value === "dark";

export const useMobileTheme = () => {
  const theme = useState<MobileThemeMode>("mobile:theme", () => "light");

  const applyTheme = (mode: MobileThemeMode) => {
    theme.value = mode;

    if (import.meta.client) {
      document.documentElement.dataset.theme = mode;
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  const loadTheme = () => {
    if (!import.meta.client) {
      return;
    }

    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    applyTheme(isThemeMode(savedTheme) ? savedTheme : "light");
  };

  const toggleTheme = () => {
    applyTheme(theme.value === "dark" ? "light" : "dark");
  };

  return {
    theme,
    applyTheme,
    loadTheme,
    toggleTheme
  };
};
