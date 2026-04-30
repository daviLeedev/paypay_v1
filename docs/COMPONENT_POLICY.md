# 모바일 웹 컴포넌트 정책

이 문서는 `apps/mobile-web`의 컴포넌트, 클래스명, ID, 디자인 컨셉, 다크모드, 폰트 사용 규칙을 정의합니다.

## 기본 방향

- 모바일 우선으로 설계합니다.
- `mobile-web`은 독립 실행과 admin iframe embedded 실행을 모두 지원해야 합니다.
- 컴포넌트는 작고 명확하게 나눕니다.
- 앱 간 직접 import는 금지하고, 공통 로직은 `packages/`를 사용합니다.
- CSS는 전역 reset과 디자인 토큰만 전역으로 두고, 화면별 스타일은 prefix로 범위를 명확히 합니다.

## 컴포넌트 네이밍

Vue 컴포넌트 파일명은 PascalCase를 사용합니다.

좋은 예:

```text
MobileHeader.vue
MobileBodyContent.vue
MobileFooter.vue
PaymentSummary.vue
FeatureFlagPanel.vue
```

역할이 불분명한 이름은 피합니다.

```text
Header.vue
Box.vue
Content.vue
Temp.vue
```

규칙:

- 앱 공통 레이아웃은 `Mobile` prefix를 사용합니다.
- 특정 도메인 UI는 도메인 이름을 앞에 사용합니다.
- 상태 표시 UI는 `Status`, `Badge`, `Empty`, `Error` 같은 의미를 이름에 포함합니다.

## Class Prefix 규칙

`mobile-web`의 class명은 `mw-` prefix를 사용합니다.

```html
<main class="mw-app-shell">
  <header class="mw-header">
    <p class="mw-header__eyebrow">PayPay Mobile</p>
  </header>
</main>
```

규칙:

- 모든 앱 전용 class는 `mw-`로 시작합니다.
- block은 `mw-component-name` 형식을 사용합니다.
- 하위 요소는 `__`를 사용합니다.
- 상태 class는 `is-`, `has-`를 사용합니다.
- variant는 `--`를 사용합니다.

예:

```css
.mw-header {}
.mw-header__eyebrow {}
.mw-button {}
.mw-button--primary {}
.mw-panel.is-active {}
.mw-list.has-empty-state {}
```

금지:

```css
.header {}
.content {}
.button {}
.active {}
.card {}
```

## ID Prefix 규칙

ID가 꼭 필요한 경우 `mw-` prefix를 사용합니다.

```html
<section id="mw-payment-summary"></section>
<nav id="mw-footer-nav"></nav>
```

규칙:

- ID는 anchor, aria 연결, 테스트 타깃처럼 필요한 경우에만 사용합니다.
- 스타일링 목적이면 ID 대신 class를 사용합니다.
- 한 페이지에서 하나만 존재해야 하는 요소에만 ID를 부여합니다.

## 디자인 컨셉

키워드:

- 신뢰감 있는 금융 UI
- 모바일 결제 서비스
- 가볍고 빠른 운영 화면
- 명확한 계층과 넉넉한 터치 영역

시각 원칙:

- 과한 장식보다 정보의 명확성을 우선합니다.
- 카드 radius는 기본 8px 이하를 사용합니다.
- 주요 CTA는 한 화면에서 가장 선명한 색 하나만 사용합니다.
- 화면 배경, 카드, 구분선, 텍스트 색은 디자인 토큰으로 관리합니다.
- 모바일 터치 영역은 최소 44px 이상을 권장합니다.

## 디자인 토큰

전역 CSS 변수는 `--mw-` prefix를 사용합니다.

```css
:root {
  --mw-color-bg: #eef2f5;
  --mw-color-surface: #ffffff;
  --mw-color-text: #18202c;
  --mw-radius-md: 8px;
}
```

규칙:

- 색상, radius, shadow, spacing, font는 가능한 토큰을 사용합니다.
- 컴포넌트 내부에 임의 hex 값을 반복해서 쓰지 않습니다.
- 새로운 색이 필요하면 먼저 토큰 추가를 검토합니다.

## 다크모드 대응

기본 대응 방식:

1. `prefers-color-scheme: dark`
2. 수동 제어가 필요하면 `html[data-theme="dark"]`

규칙:

- 컴포넌트는 직접 `#ffffff`, `#000000`에 의존하지 말고 토큰을 사용합니다.
- border, shadow, muted text도 다크모드 토큰을 따로 둡니다.
- 이미지나 아이콘이 들어오면 다크 배경에서 식별 가능한지 확인합니다.

## 폰트 정책

기본 폰트는 Pretendard를 사용합니다.

```css
font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", sans-serif;
```

운영 권장:

- 실제 배포에서는 CDN보다 self-hosted Pretendard 파일을 권장합니다.
- 초기 개발 단계에서는 system fallback이 있어도 UI가 깨지지 않아야 합니다.
- 숫자와 금액 표시는 필요 시 `font-variant-numeric: tabular-nums;`를 사용합니다.

## 접근성 규칙

- 버튼은 실제 `<button>`을 사용합니다.
- 링크 이동은 `<a>` 또는 Nuxt 링크를 사용합니다.
- 아이콘만 있는 버튼은 `aria-label`을 반드시 둡니다.
- footer, nav, main, header 같은 landmark 태그를 적극적으로 사용합니다.
- 텍스트 대비는 light/dark mode 모두에서 확인합니다.

## 현재 기본 구조

현재 `mobile-web` 기본 레이아웃:

```text
MobileHeader
MobileBodyContent
MobileFooter
```

현재 주요 class:

```text
mw-app-shell
mw-header
mw-header__eyebrow
mw-badge
mw-body
mw-hero
mw-content-list
mw-content-card
mw-footer
```
