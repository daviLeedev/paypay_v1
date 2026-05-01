import type { FeatureFlags, MobileHomeConfig } from "@repo/types";

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  newCheckout: false,
  showDebugPanel: true,
  useMockPayments: false
};

export const DEFAULT_MOBILE_HOME_CONFIG: MobileHomeConfig = {
  layoutMode: "single",
  banners: [
    {
      id: "daily-blooms",
      title: "Daily blooms, softly arranged",
      description: "Fresh bouquets for small gifts, warm rooms, and everyday rituals.",
      imageUrl: "/images/banners/daily-blooms.svg",
      linkTo: "/products/rose-bouquet",
      tone: "primary"
    },
    {
      id: "seasonal-stems",
      title: "Seasonal stems are in",
      description: "Swap this banner from Mobile Lab when the flower campaign changes.",
      imageUrl: "/images/banners/seasonal-stems.svg",
      linkTo: "/products/spring-mix",
      tone: "default"
    }
  ],
  quickActions: [
    {
      id: "bouquet",
      label: "Bouquet",
      description: "Fresh picks",
      linkTo: "/products/rose-bouquet"
    },
    {
      id: "gift",
      label: "Gift",
      description: "Wrapped",
      linkTo: "/products/tulip-basket"
    },
    {
      id: "delivery",
      label: "Delivery",
      description: "Today",
      linkTo: "/products/orchid-pot"
    }
  ],
  products: [
    {
      id: "rose-bouquet",
      title: "핑크 로즈 부케",
      subtitle: "Layered pink roses with soft greenery for a classic gift.",
      price: "31,500원",
      originalPrice: "35,000원",
      discountRate: "10%",
      rating: 4.9,
      reviewCount: 389,
      imageUrl: "/images/products/rose-bouquet.svg",
      images: ["/images/products/rose-bouquet.svg", "/images/products/rose-bouquet-detail.svg", "/images/products/rose-bouquet-wrap.svg"],
      badge: "Best",
      labels: ["멤버스데이", "스페셜", "당일배송"],
      breadcrumbs: ["상위", "꽃다발"],
      colorOptions: ["#f08aa7", "#f6c1cd", "#ffffff", "#4d7a57"],
      couponText: "첫 구매 20% 쿠폰 받으러 가기",
      rewardText: "2,500원 최대 적립",
      linkTo: "/products/rose-bouquet"
    },
    {
      id: "tulip-basket",
      title: "튤립 바스켓",
      subtitle: "Bright tulips arranged in a woven basket for cheerful mornings.",
      price: "42,000원",
      originalPrice: "48,000원",
      discountRate: "12%",
      rating: 4.8,
      reviewCount: 214,
      imageUrl: "/images/products/tulip-basket.svg",
      images: ["/images/products/tulip-basket.svg", "/images/products/tulip-basket-detail.svg", "/images/products/tulip-basket-wrap.svg"],
      badge: "Gift",
      labels: ["선물추천", "바스켓", "당일배송"],
      breadcrumbs: ["상위", "플라워 바스켓"],
      colorOptions: ["#f6c453", "#f08aa7", "#d889c8", "#c9965f"],
      couponText: "선물 포장 무료 쿠폰 받기",
      rewardText: "3,000원 최대 적립",
      linkTo: "/products/tulip-basket"
    },
    {
      id: "orchid-pot",
      title: "화이트 오키드 팟",
      subtitle: "Minimal orchid pot for desks, shelves, and calm interiors.",
      price: "55,000원",
      originalPrice: "62,000원",
      discountRate: "11%",
      rating: 4.9,
      reviewCount: 128,
      imageUrl: "/images/products/orchid-pot.svg",
      images: ["/images/products/orchid-pot.svg", "/images/products/orchid-pot-detail.svg", "/images/products/orchid-pot-wrap.svg"],
      badge: "Premium",
      labels: ["프리미엄", "화분", "관리쉬움"],
      breadcrumbs: ["상위", "화분"],
      colorOptions: ["#ffffff", "#edf4ff", "#d889c8", "#517a5b"],
      couponText: "오키드 전용 관리카드 받기",
      rewardText: "4,200원 최대 적립",
      linkTo: "/products/orchid-pot"
    },
    {
      id: "spring-mix",
      title: "스프링 믹스 부케",
      subtitle: "Seasonal stems in a loose garden-style arrangement.",
      price: "46,000원",
      originalPrice: "52,000원",
      discountRate: "11%",
      rating: 4.7,
      reviewCount: 176,
      imageUrl: "/images/products/spring-mix.svg",
      images: ["/images/products/spring-mix.svg", "/images/products/spring-mix-detail.svg", "/images/products/spring-mix-wrap.svg"],
      badge: "Seasonal",
      labels: ["시즌한정", "믹스부케", "예약가능"],
      breadcrumbs: ["상위", "시즌 플라워"],
      colorOptions: ["#f6d365", "#f08aa7", "#b57edc", "#8fbe93"],
      couponText: "시즌 플라워 10% 쿠폰 받기",
      rewardText: "3,500원 최대 적립",
      linkTo: "/products/spring-mix"
    }
  ]
};

export type FeatureFlagListener = (flags: FeatureFlags) => void;

export type FeatureFlagController = {
  getFlags(): FeatureFlags;
  isEnabled(key: string): boolean;
  setFlag(key: string, enabled: boolean): FeatureFlags;
  setFlags(flags: FeatureFlags): FeatureFlags;
  subscribe(listener: FeatureFlagListener): () => void;
};

export const mergeFeatureFlags = (base: FeatureFlags, next?: FeatureFlags): FeatureFlags => ({
  ...base,
  ...(next ?? {})
});

export const createFeatureFlagController = (initialFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS): FeatureFlagController => {
  let flags = { ...initialFlags };
  const listeners = new Set<FeatureFlagListener>();

  const notify = () => {
    const snapshot = { ...flags };
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  return {
    getFlags() {
      return { ...flags };
    },

    isEnabled(key) {
      return Boolean(flags[key]);
    },

    setFlag(key, enabled) {
      flags = { ...flags, [key]: enabled };
      notify();
      return { ...flags };
    },

    setFlags(nextFlags) {
      flags = mergeFeatureFlags(flags, nextFlags);
      notify();
      return { ...flags };
    },

    subscribe(listener) {
      listeners.add(listener);
      listener({ ...flags });
      return () => listeners.delete(listener);
    }
  };
};
