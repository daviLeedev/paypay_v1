# 모바일 웹 UI/UX 설계안

이 문서는 Figma Make 샘플을 참고하여 `apps/mobile-web`에 적용할 UI/UX 구조를 정의합니다. 목표는 디자인을 한 번 고정하는 것이 아니라, 운영 중에도 배너, 리스트 열 수, 콘텐츠 카드, 상세 화면을 쉽게 바꿀 수 있는 확장 가능한 모바일 화면 시스템을 만드는 것입니다.

## 1. 설계 목표

- Figma 샘플의 UX 패턴을 Nuxt/Vue 구조로 변환합니다.
- 1열/2열 리스트 전환을 설정값으로 제어합니다.
- 배너 이미지를 데이터만 바꿔 교체할 수 있게 합니다.
- 배너는 단일 이미지와 슬라이드 모두 지원합니다.
- 컴포넌트 class는 `mw-` prefix 정책을 따릅니다.
- 색상, spacing, radius, dark mode는 `--mw-*` 토큰을 사용합니다.
- admin-console의 Mobile Lab에서 향후 layout, feature flag, mock data 변경을 제어할 수 있도록 준비합니다.

## 2. 화면 구조

초기 모바일 홈 화면은 아래 구조를 기준으로 합니다.

```text
MobileAppShell
  MobileHeader
  MobileHomePage
    MobileHeroBanner
    MobileQuickActions
    MobileProductSection
      MobileSectionHeader
      MobileProductGrid
        MobileProductCard
    MobileContentSection
  MobileBottomNavigation
```

현재 `MobileFooter`는 이후 `MobileBottomNavigation`으로 교체하거나 역할을 분리합니다.

권장 역할:

- `MobileHeader`: 상단 브랜드, 현재 위치, 알림/메뉴 진입
- `MobileHeroBanner`: 이미지 배너 또는 슬라이드 배너
- `MobileQuickActions`: 자주 쓰는 기능 바로가기
- `MobileProductSection`: 상품/서비스 카드 목록
- `MobileProductGrid`: 1열/2열 레이아웃 제어
- `MobileProductCard`: 카드 UI 단위
- `MobileBottomNavigation`: 하단 주요 탭
- `MobileProductDetail`: 상세 화면

## 3. 데이터 우선 설계

화면은 하드코딩보다 configuration data를 먼저 받는 구조로 만듭니다.

예상 데이터:

```ts
export type MobileLayoutMode = "single" | "double";

export type MobileBannerItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkTo?: string;
  tone?: "default" | "primary" | "dark";
};

export type MobileProductItem = {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  imageUrl?: string;
  badge?: string;
  linkTo?: string;
};

export type MobileHomeConfig = {
  layoutMode: MobileLayoutMode;
  banners: MobileBannerItem[];
  products: MobileProductItem[];
};
```

이 구조를 쓰면 다음 변경이 쉬워집니다.

- 2열에서 1열로 변경
- 배너 이미지 교체
- 배너 개수 증가
- 상품 카드 정보 변경
- 섹션 순서 변경
- admin-console에서 feature flag로 레이아웃 변경

## 4. 1열/2열 리스트 전략

상품 또는 콘텐츠 목록은 `layoutMode`로 제어합니다.

```vue
<MobileProductGrid :items="products" :layout-mode="layoutMode" />
```

class 전략:

```html
<div class="mw-product-grid mw-product-grid--single"></div>
<div class="mw-product-grid mw-product-grid--double"></div>
```

CSS 전략:

```css
.mw-product-grid {
  display: grid;
  gap: var(--mw-space-md);
}

.mw-product-grid--single {
  grid-template-columns: 1fr;
}

.mw-product-grid--double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

UX 기준:

- 정보량이 많거나 설명이 긴 카드는 1열을 사용합니다.
- 이미지 중심의 짧은 카드, 카테고리, 상품 썸네일은 2열을 사용할 수 있습니다.
- 결제, 금융, 상태 안내처럼 신뢰가 중요한 정보는 1열을 우선합니다.
- 2열 카드는 텍스트가 두 줄을 넘어가면 디자인이 깨지기 쉬우므로 제목 길이 제한이 필요합니다.

## 5. 배너 전략

배너는 단일 배너와 슬라이드 배너를 같은 컴포넌트에서 처리합니다.

```vue
<MobileHeroBanner :items="banners" />
```

동작 기준:

- `items.length === 1`: 단일 배너
- `items.length > 1`: 슬라이드 배너

컴포넌트 책임:

- 이미지 표시
- title/description 오버레이 또는 하단 텍스트 표시
- indicator 표시
- 이전/다음 제어
- 자동 슬라이드 옵션은 추후 추가

권장 props:

```ts
type MobileHeroBannerProps = {
  items: MobileBannerItem[];
  autoplay?: boolean;
  intervalMs?: number;
};
```

UX 기준:

- 첫 화면에서 배너가 너무 커서 다음 콘텐츠를 완전히 밀어내지 않도록 합니다.
- 모바일 기준 aspect-ratio는 `16 / 9`, `4 / 3`, `1.9 / 1` 중 하나로 고정합니다.
- 텍스트가 이미지 위에 올라가면 dark overlay token을 사용합니다.
- 이미지 로딩 실패 시 fallback surface를 표시합니다.

## 6. 이미지 교체 전략

이미지는 컴포넌트에 직접 import하지 않고 데이터로 받는 방식을 우선합니다.

권장 위치:

```text
apps/mobile-web/public/images/banners
apps/mobile-web/public/images/products
```

사용 예:

```ts
const banners = [
  {
    id: "main-01",
    title: "오늘의 추천",
    imageUrl: "/images/banners/main-01.png"
  }
];
```

운영 확장:

- 초기에는 local public image 사용
- 이후 CMS 또는 API에서 imageUrl 수신
- admin-console Mobile Lab에서 mock banner data 주입 가능

## 7. 라우팅 전략

초기 라우팅:

```text
/              홈
/products/:id  상품 상세
/settings      설정
```

Nuxt 권장 구조:

```text
apps/mobile-web/pages/index.vue
apps/mobile-web/pages/products/[id].vue
apps/mobile-web/pages/settings.vue
```

현재 `app.vue`는 shell 역할만 남기고, 실제 화면은 `pages/`로 이동하는 것을 권장합니다.

장점:

- Figma 샘플의 MainPage/ProductDetail 구조를 Nuxt 라우팅과 자연스럽게 매핑할 수 있습니다.
- admin command의 `admin:navigate`가 실제 URL 이동으로 동작합니다.
- standalone과 embedded 모드 모두 같은 라우팅을 사용합니다.

## 8. Mobile Lab 연동 전략

admin-console에서 아래 값을 제어할 수 있게 준비합니다.

```ts
type MobileLabUiCommand =
  | { type: "ui:set-layout-mode"; payload: { layoutMode: "single" | "double" } }
  | { type: "ui:set-banners"; payload: { banners: MobileBannerItem[] } }
  | { type: "ui:set-active-banner"; payload: { index: number } };
```

적용 방향:

- 공통 타입은 `packages/types`에 추가합니다.
- 모바일 앱은 bridge command로 UI 설정을 수신합니다.
- 상태 snapshot에 현재 `layoutMode`, `activeBannerIndex`를 포함합니다.
- admin Mobile Lab은 1열/2열 toggle, banner JSON editor, image URL 입력을 제공합니다.

## 9. 컴포넌트 설계안

### `MobileAppShell.vue`

역할:

- Header, main slot, bottom navigation을 배치합니다.
- embedded/standalone mode에 따라 safe padding을 조정합니다.

props:

```ts
type Props = {
  embedded: boolean;
};
```

### `MobileHomePage.vue`

역할:

- 홈 화면 섹션을 조립합니다.
- config data를 받아 배너, quick actions, product section에 전달합니다.

props:

```ts
type Props = {
  config: MobileHomeConfig;
};
```

### `MobileHeroBanner.vue`

역할:

- 단일/슬라이드 배너를 표시합니다.
- 이미지 교체와 indicator를 지원합니다.

props:

```ts
type Props = {
  items: MobileBannerItem[];
  autoplay?: boolean;
  intervalMs?: number;
};
```

### `MobileProductGrid.vue`

역할:

- 상품 목록을 1열/2열로 표시합니다.
- grid layout만 담당하고 card 내용은 `MobileProductCard`에 위임합니다.

props:

```ts
type Props = {
  items: MobileProductItem[];
  layoutMode: "single" | "double";
};
```

### `MobileProductCard.vue`

역할:

- 상품/서비스 한 개를 표시합니다.
- 이미지, badge, title, subtitle, price를 선택적으로 표시합니다.

props:

```ts
type Props = {
  item: MobileProductItem;
  layoutMode: "single" | "double";
};
```

### `MobileProductDetail.vue`

역할:

- 상품 상세 화면을 표시합니다.
- 큰 이미지, 상세 정보, CTA, 보조 설명을 포함합니다.

## 10. CSS class 설계

주요 class:

```text
mw-app-shell
mw-page
mw-header
mw-bottom-nav
mw-hero-banner
mw-hero-banner__viewport
mw-hero-banner__slide
mw-hero-banner__indicator
mw-quick-actions
mw-product-section
mw-product-grid
mw-product-grid--single
mw-product-grid--double
mw-product-card
mw-product-card--single
mw-product-card--double
```

토큰 추가 후보:

```css
--mw-space-xs
--mw-space-sm
--mw-space-md
--mw-space-lg
--mw-color-overlay
--mw-color-accent
--mw-z-bottom-nav
```

## 11. 구현 순서

1. `packages/types`에 UI config 타입 추가
2. `apps/mobile-web/composables/useMobileUiConfig.ts` 생성
3. `app.vue`를 shell 중심으로 정리
4. `pages/index.vue` 생성
5. `MobileHeroBanner.vue` 구현
6. `MobileProductGrid.vue`, `MobileProductCard.vue` 구현
7. `MobileBottomNavigation.vue` 구현
8. bridge command로 layoutMode와 banner data 변경 대응
9. admin-console Mobile Lab에 layout toggle과 banner editor 추가

## 12. 결정이 필요한 항목

구현 전에 정하면 좋은 항목:

- 홈 목록의 기본값: 1열 또는 2열
- 배너 aspect-ratio: `16 / 9`, `4 / 3`, `1.9 / 1`
- 하단 navigation 사용 여부
- 상품 상세 화면을 바로 만들지 여부
- 배너 자동 슬라이드 기본 활성화 여부

현재 추천 기본값:

- 홈 목록 기본값: 1열
- 배너 aspect-ratio: `16 / 9`
- 하단 navigation: 사용
- 상품 상세 화면: 2차 구현
- 자동 슬라이드: 기본 off, 수동 swipe/click 우선
