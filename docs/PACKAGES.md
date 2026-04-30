# 공유 패키지 설명

이 문서는 `packages/` 아래에 만든 공유 패키지들의 역할과 사용 방법을 설명합니다. 핵심 원칙은 `mobile-web`과 `admin-console`이 서로 직접 import하지 않고, 필요한 계약과 공통 로직만 공유 패키지를 통해 사용하는 것입니다.

## 전체 원칙

- `apps/mobile-web`은 독립 실행이 가능해야 합니다.
- `apps/admin-console`은 iframe과 bridge를 통해서만 모바일 앱을 제어합니다.
- 앱 간 직접 import는 금지합니다.
- 공통 타입, 메시지 계약, 로깅, 설정, 상태 변환 로직은 `packages/`에 둡니다.

허용되는 import 예시:

```ts
import { createBridgeChannel } from "@repo/bridge";
import { logEvent } from "@repo/logger";
import type { AdminCommand } from "@repo/types";
```

금지되는 import 예시:

```ts
import Something from "../../admin-console/...";
import Something from "../../mobile-web/...";
```

## `@repo/types`

위치: `packages/types`

브리지, 로거, 설정, 상태 스냅샷에서 함께 쓰는 TypeScript 타입을 정의합니다. 두 앱과 다른 공유 패키지는 이 패키지를 기준으로 같은 메시지 구조를 사용합니다.

주요 export:

- `BRIDGE_NAMESPACE`
- `BRIDGE_VERSION`
- `BridgeEnvelope`
- `BridgeKind`
- `MobileEvent`
- `AdminCommand`
- `MobileStateSnapshot`
- `FeatureFlags`
- `MockBehavior`
- `MobileLogEntry`

역할:

- postMessage로 오가는 메시지의 표준 envelope 정의
- admin이 보낼 수 있는 command 타입 정의
- mobile이 보낼 수 있는 event, log, state 타입 정의
- feature flag와 mock behavior의 공통 타입 정의

사용 위치:

- `@repo/bridge`에서 메시지 검증과 생성에 사용
- `@repo/logger`에서 로그 payload 타입에 사용
- `mobile-web` 플러그인에서 admin command 처리에 사용
- `admin-console` Mobile Lab에서 로그, 이벤트, 상태 표시 타입에 사용

## `@repo/bridge`

위치: `packages/bridge`

`window.postMessage` 기반 통신을 안전하게 감싼 패키지입니다. 모바일 앱과 어드민 앱은 이 패키지를 통해 메시지를 보내고 받습니다.

주요 export:

- `createBridgeChannel(options)`
- `createBridgeMessage(source, kind, payload)`
- `isBridgeEnvelope(value)`
- `BridgeChannel`

역할:

- 메시지 envelope 생성
- `window.addEventListener("message")` 등록
- bridge namespace와 version 검증
- 잘못된 메시지 무시
- parent window 또는 iframe contentWindow로 메시지 전송

모바일에서 사용하는 방식:

```ts
const bridge = createBridgeChannel({ source: "mobile-web" });
bridge.sendToParent("event", {
  type: "mobile:ready",
  payload: { embedded: true, href: window.location.href }
});
```

어드민에서 사용하는 방식:

```ts
const bridge = createBridgeChannel({ source: "admin-console" });
bridge.send(iframe.contentWindow, "command", {
  type: "admin:request-state"
});
```

주의:

- bridge는 앱을 직접 알지 않습니다.
- 메시지 구조만 검사하고, 실제 비즈니스 처리는 각 앱의 client plugin에서 합니다.
- SSR에서 `window`를 직접 참조하지 않도록 Nuxt에서는 `*.client.ts` 플러그인 안에서 사용합니다.

## `@repo/logger`

위치: `packages/logger`

모바일 앱의 이벤트 로그를 표준 형태로 만들고, bridge가 연결되어 있으면 어드민으로 전달합니다. 어드민이 없거나 standalone 모드여도 오류 없이 조용히 동작합니다.

주요 export:

- `createLogger(options)`
- `configureLogger(logger)`
- `logEvent(input)`
- `Logger`

역할:

- 로그 항목에 `id`, `timestamp`, `source`, `level` 부여
- bridge가 설정된 경우 `"log"` 메시지로 parent에 전송
- standalone 실행 시에도 같은 `logEvent()` API 유지

모바일에서 사용하는 방식:

```ts
logEvent({
  type: "payment-button-clicked",
  payload: { amount: 12.4 }
});
```

초기화 위치:

- `apps/mobile-web/plugins/mobile-bridge.client.ts`

이유:

- logger가 `window.parent`나 Nuxt 앱 구조를 직접 알지 않게 하기 위해서입니다.
- 모바일 앱은 admin 존재 여부와 상관없이 같은 로깅 API를 사용합니다.

## `@repo/config`

위치: `packages/config`

feature flag 기본값과 간단한 feature flag controller를 제공합니다. 어드민은 flag 변경 command를 보내고, 모바일은 받은 값을 런타임 상태에 반영합니다.

주요 export:

- `DEFAULT_FEATURE_FLAGS`
- `createFeatureFlagController(initialFlags)`
- `mergeFeatureFlags(base, next)`
- `FeatureFlagController`

기본 flag:

```ts
{
  newCheckout: false,
  showDebugPanel: true,
  useMockPayments: false
}
```

역할:

- 앱들이 같은 기본 feature flag 목록 사용
- flag 병합 로직 중복 제거
- 추후 서버 기반 설정이나 localStorage persistence로 확장 가능한 기준점 제공

현재 사용 위치:

- `mobile-web`에서 런타임 flag 초기값으로 사용
- `admin-console`에서 Mobile Lab 토글 목록 초기값으로 사용

## `@repo/state-adapter`

위치: `packages/state-adapter`

모바일 앱의 내부 상태를 어드민이 읽기 좋은 스냅샷 형태로 변환합니다. 현재는 Nuxt state와 route 정보를 받아 `MobileStateSnapshot`으로 만듭니다.

주요 export:

- `DEFAULT_MOCK_BEHAVIOR`
- `createMobileStateSnapshot(input)`
- `MobileSnapshotInput`

역할:

- route, query, feature flags, mock behavior, embedded 여부를 하나의 snapshot으로 구성
- 어드민 Mobile Lab에서 표시할 상태 형태를 표준화
- 추후 Pinia 같은 상태 관리 도구를 붙이더라도 bridge payload 구조는 유지

모바일에서 사용하는 방식:

```ts
bridge.sendToParent(
  "state",
  createMobileStateSnapshot({
    route,
    featureFlags,
    mockBehavior,
    embedded
  })
);
```

## 앱별 연결 방식

### `apps/mobile-web`

주요 파일:

- `plugins/mobile-bridge.client.ts`
- `composables/useMobileRuntime.ts`
- `app.vue`

동작:

- `?embedded=true` 또는 iframe 여부로 embedded 모드 감지
- 시작 시 `handshake`, `mobile:ready`, 초기 state 전송
- admin command 수신
- navigation, feature flag, mock behavior 변경 처리
- 로그와 상태 변경을 admin으로 전송
- admin이 없어도 standalone 화면으로 정상 동작

### `apps/admin-console`

주요 파일:

- `plugins/admin-bridge.client.ts`
- `composables/useMobileLabState.ts`
- `app.vue`

동작:

- mobile-web을 iframe으로 로드
- mobile에서 오는 `handshake`, `event`, `log`, `state` 메시지 수신
- 로그, 이벤트, 상태 snapshot 표시
- iframe의 `contentWindow`로 admin command 전송
- navigation, feature flag, mock behavior 제어

## 확장 가이드

새 command를 추가할 때:

1. `packages/types/src/index.ts`의 `AdminCommand` union에 타입을 추가합니다.
2. `apps/mobile-web/plugins/mobile-bridge.client.ts`에서 command 처리 로직을 추가합니다.
3. `apps/admin-console/app.vue` 또는 관련 컴포넌트에서 command를 전송합니다.

새 mobile event를 추가할 때:

1. `packages/types/src/index.ts`의 `MobileEvent` union에 타입을 추가합니다.
2. 모바일 앱에서 `bridge.sendToParent("event", ...)`로 전송합니다.
3. 어드민은 기존 event stream에서 자동으로 확인할 수 있고, 필요하면 별도 UI를 추가합니다.

새 공유 로직이 필요할 때:

- 앱 한쪽에만 필요한 로직이면 해당 앱 안에 둡니다.
- 두 앱이 함께 써야 하는 타입이나 순수 로직이면 `packages/`에 새 패키지 또는 기존 패키지로 추가합니다.
- `apps/` 사이 직접 import로 해결하지 않습니다.
