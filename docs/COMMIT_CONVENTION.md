# 커밋 컨벤션

이 문서는 PayPay 프론트엔드 모노레포에서 커밋 메시지를 일관되게 남기기 위한 규칙입니다.

## 목적

- 변경 목적을 커밋 제목만 보고 빠르게 파악합니다.
- `mobile-web`, `admin-console`, `packages/*` 변경 범위를 명확히 남깁니다.
- README의 `Version History`와 커밋 메시지가 서로 보완되도록 합니다.
- 자동화 도구, 릴리즈 노트, 변경 이력 추적에 활용할 수 있는 형태를 유지합니다.

## 기본 형식

Conventional Commits 형식을 사용합니다.

```text
type(scope): summary
```

예시:

```text
feat(mobile): add signup validation form
fix(mobile): replace drawer arrow icon asset
docs(policy): add commit convention
```

## Type 규칙

| Type | 사용 시점 |
| --- | --- |
| `feat` | 사용자에게 보이는 기능 추가 |
| `fix` | 버그 수정, 잘못된 동작 수정 |
| `docs` | 문서 추가 또는 수정 |
| `style` | 포맷, CSS 조정, UI 표현 변경 중 로직 영향이 작은 변경 |
| `refactor` | 동작은 유지하고 구조를 개선 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가 또는 수정 |
| `build` | 빌드 설정, 패키지 의존성, lockfile 변경 |
| `ci` | CI/CD 설정 변경 |
| `chore` | 개발 환경, 스크립트, 기타 유지보수 |
| `revert` | 이전 커밋 되돌리기 |

## Scope 규칙

모노레포이므로 scope에는 변경 위치나 기능 영역을 씁니다.

권장 scope:

| Scope | 대상 |
| --- | --- |
| `mobile` | `apps/mobile-web` |
| `admin` | `apps/admin-console` |
| `lab` | admin의 Mobile Lab 기능 |
| `bridge` | `packages/bridge` |
| `logger` | `packages/logger` |
| `config` | `packages/config` |
| `state` | `packages/state-adapter` |
| `types` | `packages/types` |
| `docs` | `docs/*`, README 문서 |
| `repo` | workspace, pnpm, scripts, hooks 등 저장소 공통 설정 |

여러 영역을 함께 수정했다면 가장 중심이 되는 scope를 고릅니다.

예시:

```text
feat(mobile): add product detail login guard
fix(admin): resolve bridge package import
build(repo): add pinia dependencies to mobile app
```

## Summary 작성 규칙

요약은 영어 소문자 문장을 기본으로 합니다. 팀에서 한글 커밋을 쓰기로 합의한 경우 한글도 허용합니다.

권장:

```text
feat(mobile): add product card layout toggle
fix(mobile): align two column product image sizing
docs(docs): add mobile component policy
```

비권장:

```text
update
fix
작업함
여러가지 수정
```

규칙:

- 72자 안쪽을 권장합니다.
- 마침표를 붙이지 않습니다.
- 무엇을 했는지보다 왜 필요한 변경인지가 드러나면 더 좋습니다.
- 한 커밋에는 한 가지 의도를 담습니다.

## Body 작성 규칙

제목만으로 부족할 때 본문을 추가합니다.

```text
feat(mobile): add signup form validation

Validate name, email domain, password confirmation, and address before
registering the demo user in Pinia.
```

본문에는 다음을 적습니다.

- 변경 이유
- 주요 구현 방식
- 사용자가 보게 되는 영향
- 마이그레이션이나 주의사항

## Breaking Change

기존 API, 메시지 계약, 패키지 export, 라우트, 저장소 구조가 깨지는 변경은 반드시 표시합니다.

```text
feat(bridge)!: rename mobile command event type

BREAKING CHANGE: admin-console must send mobile:command instead of command.
```

## Monorepo 주의사항

- 앱 간 직접 import를 만들지 않습니다.
- 공유 로직은 `packages/*`에 둡니다.
- `apps/mobile-web` 변경은 standalone 실행을 깨지 않아야 합니다.
- admin과 mobile 통신 변경은 `bridge`, `types` scope를 함께 고려합니다.
- 의존성 추가가 있으면 `build(repo)` 또는 대상 앱 scope를 사용합니다.

예시:

```text
build(mobile): add pinia module
feat(types): extend mobile product item metadata
fix(bridge): ignore malformed postMessage payloads
```

## 커밋 분리 기준

다음 경우에는 커밋을 나누는 것을 권장합니다.

- 기능 구현과 문서 변경이 독립적일 때
- UI 조정과 상태 관리 로직 변경이 독립적일 때
- `mobile-web`과 `admin-console` 변경이 서로 배포 단위가 다를 수 있을 때
- 패키지 API 변경과 앱 적용 변경이 큰 경우

한 커밋으로 묶어도 좋은 경우:

- 작은 UI 변경과 그에 필요한 CSS가 같은 컴포넌트 안에 있을 때
- 버그 수정과 해당 버그를 막는 테스트가 함께 있을 때
- 문서 링크 추가와 새 문서 생성이 한 작업일 때

## README Version History와의 관계

커밋 메시지는 개발자를 위한 상세 의도이고, README의 `Version History`는 프로젝트 변경 요약입니다.

커밋:

```text
feat(mobile): add drawer login cta
```

README Version History summary:

```text
mobile drawer login cta added
```

자동 version history hook을 사용하는 경우에도 커밋 메시지는 이 문서의 규칙을 따릅니다.

## 예시 모음

```text
feat(mobile): add flower product detail page
feat(mobile): add drawer theme toggle
fix(mobile): hide scrollbars globally
fix(admin): disable vite overlay in mobile lab
docs(policy): add component naming rules
docs(policy): add commit convention
refactor(mobile): split product gallery controls
build(mobile): add pinia and nuxt pinia module
chore(repo): install version history hooks
```

## 빠른 체크리스트

커밋 전 아래를 확인합니다.

- `type(scope): summary` 형식인가?
- scope가 변경 위치를 설명하는가?
- summary가 `update`, `fix`처럼 너무 모호하지 않은가?
- 한 커밋에 너무 많은 의도가 섞이지 않았는가?
- package나 bridge 계약 변경이 있다면 관련 문서와 타입도 함께 갱신했는가?
