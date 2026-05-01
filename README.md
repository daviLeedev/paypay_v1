# PayPay Frontend Platform

Nuxt 3 기반 monorepo frontend platform입니다.

## Apps

- `apps/mobile-web`: 독립 실행 가능한 모바일 웹 앱
- `apps/admin-console`: 운영 어드민 콘솔과 Mobile Lab

## Packages

- `@repo/types`: 공통 타입과 bridge 메시지 계약
- `@repo/bridge`: postMessage 기반 통신
- `@repo/logger`: 모바일 이벤트 로깅
- `@repo/config`: feature flag 설정
- `@repo/state-adapter`: 모바일 상태 snapshot 변환

## Docs

- [공유 패키지 설명](./docs/PACKAGES.md)
- [모바일 웹 컴포넌트 정책](./docs/COMPONENT_POLICY.md)
- [모바일 웹 UI/UX 설계안](./docs/MOBILE_UI_STRATEGY.md)
- [버전 기록 정책](./docs/VERSION_POLICY.md)
- [커밋 컨벤션](./docs/COMMIT_CONVENTION.md)

## Version History

커밋 단위 변경 사항은 이 섹션에 최신순으로 남깁니다. 작성 규칙은 [버전 기록 정책](./docs/VERSION_POLICY.md)을 따릅니다.

| Version | Date | Commit | Summary |
| --- | --- | --- | --- |
| `0.1.4` | 2026-05-02 | 2f0dc73 | admin mobile lab controls added |
| `0.1.3` | 2026-05-02 | ebf7e19 | version history hooks added |
| `0.1.2` | 2026-05-02 | 32bd501 | project workflow policies added |
| `0.1.1` | 2026-05-02 | 50429df | flower shop mobile experience added |
| `0.1.0` | 2026-05-01 | initial | monorepo, bridge/logger/config/state packages, mobile layout policy |
