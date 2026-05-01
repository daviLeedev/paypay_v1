export default defineNuxtPlugin(() => {
  const { loadTheme } = useMobileTheme();
  loadTheme();
});
