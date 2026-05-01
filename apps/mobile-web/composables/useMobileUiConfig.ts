import { DEFAULT_MOBILE_HOME_CONFIG } from "@repo/config";
import type { MobileBannerItem, MobileHomeConfig, MobileLayoutMode, MobileUiState } from "@repo/types";

const cloneHomeConfig = (config: MobileHomeConfig): MobileHomeConfig => JSON.parse(JSON.stringify(config)) as MobileHomeConfig;

const clampIndex = (index: number, length: number) => {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
};

export const useMobileUiConfig = () => {
  const homeConfig = useState<MobileHomeConfig>("mobile:home-config", () => cloneHomeConfig(DEFAULT_MOBILE_HOME_CONFIG));
  const activeBannerIndex = useState<number>("mobile:active-banner-index", () => 0);

  const uiState = computed<MobileUiState>(() => ({
    homeConfig: cloneHomeConfig(homeConfig.value),
    activeBannerIndex: activeBannerIndex.value
  }));

  const setLayoutMode = (layoutMode: MobileLayoutMode) => {
    homeConfig.value = {
      ...homeConfig.value,
      layoutMode
    };
  };

  const setBanners = (banners: MobileBannerItem[]) => {
    homeConfig.value = {
      ...homeConfig.value,
      banners: banners.map((banner) => ({ ...banner }))
    };
    activeBannerIndex.value = clampIndex(activeBannerIndex.value, banners.length);
  };

  const setActiveBannerIndex = (index: number) => {
    activeBannerIndex.value = clampIndex(index, homeConfig.value.banners.length);
  };

  const resetHomeConfig = () => {
    homeConfig.value = cloneHomeConfig(DEFAULT_MOBILE_HOME_CONFIG);
    activeBannerIndex.value = 0;
  };

  return {
    homeConfig,
    activeBannerIndex,
    uiState,
    setLayoutMode,
    setBanners,
    setActiveBannerIndex,
    resetHomeConfig
  };
};
