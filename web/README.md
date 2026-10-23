# 하루공부 web (본개발)

Next.js 15(App Router) + TypeScript + Supabase. 기준 화면·규칙은 `../prototype`, `../docs`.

## 실행

```bash
npm install
npm run content   # prototype/build·data → public/content/*.json (콘텐츠 변환)
npm run dev       # http://localhost:3000
npm test          # 엔진·보상 규칙 테스트 (vitest)
npm run build && npx next start -p 3123
npm run proto-css # 프로토타입 CSS → src/styles/proto (화면별 범위만 씌움, 원본은 고치지 않음)
# 프로토타입 코드를 그대로 가져오는 생성 스크립트 (결과 파일은 직접 고치지 않는다)
npm run hanja-core   # 한자 데이터·문제 → src/lib/subjects/hanjaCore.js, 획순 → public/content/strokes.json
npm run math-app     # 연산 → src/lib/subjects/mathApp.js
npm run typ-app      # 타자 → src/lib/subjects/typApp.js
npm run play-app     # 게임(스피드·대결방·산성비) → src/lib/play/playApp.js, public/content/play.json
npm run search-app   # 통합 검색 → src/lib/searchApp.js, public/content/search.json
node e2e/compare.mjs [폴더]          # 놀이터·로그인: 프로토타입과 나란히 비교 (서버 3123 실행 중)
node e2e/compare-sub.mjs hist [폴더] # 과목 화면 비교 (hanja·eng·kor·sci·hist·math)
node e2e/compare-extra.mjs [폴더]    # 게임 진행·검색 비교
```

Supabase 키가 없으면 브라우저 저장(로컬 모드)으로 동작한다. 키를 받으면 `.env.example` → `.env.local`에 채우고
`supabase/migrations/0001_init.sql`을 적용한다.

## 구조

| 경로 | 내용 |
| --- | --- |
| `src/lib/engine/` | **공통 학습 엔진** — 규칙 숫자(`rules.ts`), 오답 카드·복습·세트 구성(`progress.ts`), 학습 세션(`session.ts`), 보기 위치 섞기(`choices.ts`). 과목은 `SubjectPlugin`(문제 생성기)만 만들어 꽂는다 |
| `src/lib/rewards/` | 보상 규칙(프로토타입 hgs.js) — 캐시·XP·오늘 할 일·밀린 공부·게임 횟수·잠금 |
| `src/lib/subjects.ts` | 과목·갈래·주색 |
| `src/lib/store.ts`, `account.ts`, `supabase.ts` | 로그인·자녀·보상 상태 저장 |
| `src/components/` | 셸(하단 메뉴·시트·공부 헤더), 놀이터 틀, 자녀 컨텍스트 |
| `src/components/subject/` | 과목 화면 공통 틀(홈·오답노트·학습결과·개념·풀이·결과), 연표 |
| `src/lib/subjects/` | 과목 플러그인: 한자(hanja)·영단어(eng)·국어(kor)·과학(sci)·역사(hist), 용어 문제 공통(termq), 화면 문구 기본값(ui) |
| `src/lib/subjects/*App.js`, `hanjaCore.js` | 프로토타입 코드를 생성 스크립트로 그대로 옮긴 것 (연산·타자·한자 데이터) |
| `src/components/subject/Writer.tsx`, `Ink.tsx` | 한자 획순 쓰기(HanziWriter), 영단어 펜 쓰기(4선 노트) |
| `src/lib/slide.ts` | 슬라이드(보기·받아쓰기)·나만의 단어장 (프로토타입 slide.js) |
| `src/lib/play/` | 아바타·도장 그림, 놀이터 데이터, 마이 통계 |
| `src/styles/proto/` | 프로토타입 CSS (자동 생성) |
| `src/app/` | 로그인·자녀 선택·홈·공부(과목 홈·탭2·갈래 탭)·게임·랭킹·마이 |
| `scripts/convert-content.mjs` | build.py와 같은 규칙으로 콘텐츠 합치기 |
| `supabase/migrations/` | DB 스키마 + RLS(보호자는 자기 자녀 것만) |

## 화면 원칙
화면은 프로토타입(prototype/dist/index.html)과 똑같아야 한다. 프로토타입 CSS를 그대로 쓰고 마크업을 그대로 옮긴 뒤
compare 스크립트로 나란히 비교한다.

## 진행 상황
- [x] 셸 · 로그인 · 놀이터(홈·게임·랭킹·마이·꾸미기)
- [x] 한자(학교 필수·급수별·천자문, 획순 쓰기) · 영단어(듣기·철자·펜) · 국어 · 과학 · 역사(연표)
- [x] 연산(키패드) · 타자(자리 연습·낱말·짧은 글·산성비)
- [x] 슬라이드·받아쓰기·나만의 단어장 · 통합 검색 · 스피드 게임·대결방(가상 친구)
- [ ] Supabase 연결 (키 받은 뒤): 인증, 진도·오답·보상 저장, 대결방 실시간, 랭킹
- [ ] 연산·타자도 공통 엔진·React로 옮기기 (지금은 프로토타입 코드를 그대로 띄움)
