# 버전 기록 정책

이 문서는 커밋할 때마다 README에 버전 정보를 남기는 규칙을 정의합니다.

## 목적

- 커밋 단위로 프로젝트 변경 흐름을 빠르게 파악합니다.
- README에서 최신 변경 사항을 바로 확인할 수 있게 합니다.
- 상세한 릴리즈 문서가 없어도 최소한의 변경 이력을 유지합니다.

## 기록 위치

버전 기록은 루트 `README.md`의 `Version History` 섹션에 남깁니다.

형식:

```md
| Version | Date | Commit | Summary |
| --- | --- | --- | --- |
| `0.1.0` | 2026-05-01 | initial | monorepo scaffold |
```

## 작성 시점

다음 작업을 커밋할 때마다 README의 `Version History`에 1줄을 추가합니다.

- 기능 추가
- 버그 수정
- 구조 변경
- 패키지 추가 또는 삭제
- 정책 문서 추가 또는 변경
- 빌드, 배포, 실행 방식 변경

단순 오타 수정이나 의미 없는 포맷팅만 있는 경우에는 기록을 생략할 수 있습니다.

## 자동 기록 방식

이 프로젝트는 git hook으로 README 버전 기록을 자동 추가할 수 있습니다.

처음 한 번만 아래 명령을 실행합니다.

```powershell
pnpm hooks:install
```

설치 후 `git commit`을 실행하면 `pre-commit` hook이 동작합니다.

동작 방식:

- staged file 목록을 읽습니다.
- `README.md`의 `Version History` 표에 새 행을 추가합니다.
- `README.md`를 자동으로 `git add` 합니다.
- commit 값은 `pending`으로 기록합니다.
- 최신 행이 이미 `pending`이면 중복 추가하지 않습니다.

자동으로 추가되는 예:

```md
| `0.1.1` | 2026-05-01 | pending | apps/mobile-web/app.vue, docs/COMPONENT_POLICY.md |
```

원하는 요약을 직접 넣고 싶으면 커밋 전에 아래 명령을 먼저 실행할 수 있습니다.

```powershell
pnpm version:history "mobile layout policy updated"
```

그 다음 커밋하면 됩니다.

## 작성 순서

최신 기록이 표의 가장 위에 오도록 작성합니다.

예:

```md
| `0.1.2` | 2026-05-02 | a1b2c3d | mobile footer navigation added |
| `0.1.1` | 2026-05-01 | 9f8e7d6 | component policy added |
| `0.1.0` | 2026-05-01 | initial | monorepo scaffold |
```

## Version 규칙

초기 개발 단계에서는 `0.x.y` 형식을 사용합니다.

- `0.MINOR.PATCH`
- `MINOR`: 기능, 구조, 정책처럼 의미 있는 변화
- `PATCH`: 버그 수정, 작은 UI 조정, 문서 보완

예:

- `0.1.0`: 초기 구조 생성
- `0.2.0`: Mobile Lab 주요 기능 추가
- `0.2.1`: bridge 메시지 검증 버그 수정

정식 운영 전환 시 `1.0.0`부터 semantic versioning을 적용합니다.

## Commit 값 규칙

커밋 전에는 아직 hash가 없으므로 아래 중 하나를 사용합니다.

- 커밋 전 작성: `pending`
- 최초 기록: `initial`
- 커밋 후 수정 가능: 짧은 hash 7자리

권장 흐름:

1. 작업 완료
2. README `Version History`에 `pending`으로 기록 추가
3. 커밋 생성
4. 필요하면 `pending`을 실제 짧은 hash로 교체하는 후속 커밋 작성

작은 프로젝트에서는 `pending` 그대로 두어도 됩니다.

같은 커밋 안에 실제 commit hash를 정확히 넣는 것은 권장하지 않습니다. README 내용이 바뀌면 commit hash도 다시 바뀌기 때문입니다.

## 자동 push 정책

커밋할 때마다 자동 push도 기술적으로는 가능합니다. 다만 실수로 원격 브랜치에 바로 올라갈 수 있으므로 기본값은 꺼져 있습니다.

hook 설치 후 아래 환경 변수를 켠 상태에서 커밋하면 `post-commit` hook이 `git push`를 실행합니다.

PowerShell:

```powershell
$env:PAYPAY_AUTO_PUSH = "1"
git commit -m "message"
```

자동 push를 끄려면:

```powershell
Remove-Item Env:\PAYPAY_AUTO_PUSH
```

권장 방식:

- 일반 작업: 자동 README 기록만 사용
- push: 직접 `git push`
- 정말 자동화가 필요할 때만 `PAYPAY_AUTO_PUSH=1` 사용

## Summary 작성 규칙

Summary는 영어 또는 한국어 중 하나로 작성할 수 있습니다. 한 줄로 짧게 씁니다.

좋은 예:

```text
mobile component policy added
bridge command handling fixed
모바일 기본 레이아웃 추가
```

피할 예:

```text
update
fix
작업함
여러 가지 수정
```

## 커밋 메시지와의 관계

README의 버전 기록은 커밋 메시지를 대체하지 않습니다.

- 커밋 메시지: 변경 의도를 자세히 표현
- README Version History: 외부에서 빠르게 보는 요약

커밋 메시지 예:

```text
feat(mobile): add base layout components
docs(policy): add component naming rules
fix(bridge): resolve workspace alias paths
```

README Summary 예:

```text
mobile base layout components added
component naming and dark mode policy added
workspace alias resolution fixed
```

## 기록 템플릿

새 기록을 추가할 때 아래 행을 복사해서 표의 가장 위에 추가합니다.

```md
| `0.0.0` | YYYY-MM-DD | pending | summary |
```

## 주의사항

- README에는 너무 긴 변경 설명을 쓰지 않습니다.
- 상세 설명이 필요하면 별도 docs 문서를 만들고 링크합니다.
- 앱별 세부 변경 이력이 많아지면 추후 `CHANGELOG.md`를 분리할 수 있습니다.
- 버전 기록을 남길 때 기존 기록을 삭제하지 않습니다.
