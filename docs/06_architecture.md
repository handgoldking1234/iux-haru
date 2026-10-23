# 06. 프로토타입 구조

> 프로토타입은 빠른 확인용으로, 서버 없이 **단일 HTML 파일**로 만들었다. 모든 상태는 브라우저 localStorage에 있다.
> 본개발에서 이 구조를 그대로 옮길 필요는 없다. 화면·규칙·데이터의 기준으로만 쓴다(`08_roadmap.md`).

## 빌드 결과
`prototype/build/build.py`를 실행하면 `study.html`(약 10MB) 하나가 나온다. 이 파일이 곧 `prototype/dist/index.html`이다.

```
study.html (shell.html)
 ├─ 공통 저장소 HGS (hgs.js)        캐시·XP·오늘 할 일·게임 제한·알림
 ├─ 로그인·자녀 선택 (#auth)
 ├─ 헤더(과목 드롭다운·탭2·검색·알림·전체보기) + 하단 메뉴(#gnav)
 ├─ 검색 (search.js + 색인 __SIDX__)
 └─ iframe(srcdoc)로 과목 화면을 띄움 — SRC 객체에 과목별 HTML 문자열
     play   놀이터(홈·게임·랭킹·마이)   play.tpl.html + play.js + play.css
     math   연산                        math.html (단독 파일, 직접 수정)
     hanja  한자(학교/급수/천자문)       head.html + app.js + extra.css + data_hj.json + pics.js + strokes.js
     eng    영단어                      head.html + eng.js + eng_x.json(어원 포함)
     kor    국어                        head.html + kor.js + kor.json
     sci    과학                        head.html + sci.js + sci.json
     hist   역사                        head.html + hist.js + hist.json
     typ    타자                        head.html + typ.js + typ.json
```

- 과목 화면(play 제외)마다 `build.py`의 **NAVHOOK**을 붙인다. NAVHOOK이 하는 일:
  - 과목 내부 탭(nav#tabs)을 숨기고, 셸의 탭2와 헤더 표시를 맞춘다(`parent.hgSub`).
  - `makeQ`를 감싸 다시 낼 때 정답 위치를 바꾼다(`hg-lastpos-<제목>`).
  - 오답 수 배지를 바로가기 버튼에 복사한다.
- 한자·영단어·국어·과학·역사에는 **slide.js + slide.css**(슬라이드·받아쓰기·단어장)를 함께 붙인다.
- 과목 → 셸 통신: `postMessage({hg:'ok'|'no'|'pass'|'grad', s:'과목키'})` → 셸이 효과음 재생, `HGS.event()`, 캐시 팝업.
- 셸 → 과목 통신: `frame.contentWindow.subTab(k)`, `hgSlide()`, `hgWordbook()` 같은 전역 함수 호출.

## 과목 엔진의 공통 구조 (app.js 기준, 나머지는 복제·변형)
- `STAGES`: 단원과 평가 목록. `IDX`(id→순번), `STOF`(항목→단원 id).
- `S.profiles[S.active]` = 학생별 진도 `P()`. 주요 필드:
  - `stage`: 현재 단원 순번. `passed`: 통과 단원 기록. `cards`: 오답 카드.
  - `bp`: 단원별 난이도 위치. `streak`: 연속 정답. `wr`: 단원별 틀린 수. `read`: 소개를 읽었는지.
  - `hist`: 날짜별 기록. `stat`: 영역별 기록.
- `plan(p)`로 오늘 세트를 만들고, `buildQueue`로 문제 순서를 정하고, `makeQ(spec)`로 문제를 만든다. 답을 고르면 `choose(k)`가 처리한다.
- `infoHTML(id)`: 소개·설명 카드.
- 날짜는 `today()` = 로컬 날짜 기준 일 번호(정수)다.

## localStorage 키

| 키 | 내용 |
| --- | --- |
| `harugongbu-auth` | 로그인 정보 `{email, kids:[{name, grade}]}` (프로토타입용) |
| `harugongbu-play-v1` | HGS 공통 상태(캐시·XP·꾸미기·오늘 할 일·게임·알림) |
| `harugongbu-study` / `harugongbu-subject` | 마지막으로 공부한 과목 |
| `semharu-v7` | 연산 진도 |
| `hanja-ssiat-v3` / `hanja-school-v1` / `hanja-cjm-v1` | 한자 급수별 / 학교 필수 / 천자문 진도 |
| `eng-haru-v1` | 영단어 진도 |
| `kor-<갈래>-v1`, `sci-<갈래>-v2`, `hist-<갈래>-v1` | 국어·과학·역사 갈래별 진도 |
| `typing-haru-v1` | 타자 진도·기록 |
| `*-track` | 과목별 마지막 갈래 |
| `hanja-write`, `eng-pen` | 쓰기 옵션 |
| `hg-lastpos-<제목>` | 문제별 직전 정답 위치(최대 3,000개) |
| `hg-slide2-<제목>` | 슬라이드 설정 |
| `hg-wb-<제목>-<학생>` | 나만의 단어장 `{cats:[{id,name,items:[]}], cur}` |
| `harugongbu-recent-search` | 최근 검색어 10개 |

## 테스트
- Playwright 스크립트 `prototype/build/t*.mjs`. 대부분 `study.html`이나 과목 HTML을 열고 시나리오를 돌려 스크린샷을 남긴다.
- 로그인은 이렇게 건너뛴다: `addInitScript(()=>localStorage.setItem('harugongbu-auth', JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})))`.
- 알림 팝업(`.alm`)은 지우고 시작한다.
- 주요 테스트:

| 파일 | 확인하는 것 |
| --- | --- |
| `tsci.mjs` | 과학 갈래별 전체 진도 시뮬레이션(끝까지 통과) |
| `th3.mjs`, `tcjm.mjs`, `tcjm2.mjs` | 한자 학교 필수·천자문 전체 진도, 구절 문제 유형 |
| `trs.mjs` | 다시 낼 때 정답 위치가 바뀌는지 |
| `tgs.mjs`, `tpr.mjs` | 게임, 비공개 방 코드 |
| `tau.mjs` | 로그인·로그아웃·탈퇴 |
| `tslide2.mjs`, `tcard.mjs`, `tcd.mjs`, `tspd.mjs` | 슬라이드 보기·받아쓰기·한 화면 카드·타이머·속도 |
| `twb.mjs` | 단어장 담기·카테고리·복습 |
| `tsrch.mjs` | 통합 검색 결과와 이동 |

- 크로미움 경로는 `/opt/pw-browsers/chromium-1194/...`로 하드코딩돼 있다. 환경에 맞게 바꾼다.

## 알려진 기술 부채 (본개발에서 정리할 것)
- 과목 엔진 5개가 복사로 만들어져 코드가 겹친다. 예: `kor.js` 머리 주석이 역사 것으로 남아 있다. → 공통 학습 엔진 하나 + 과목별 문제 생성기로 나눈다.
- `math.html`은 빌드 전에 만들어진 단독 파일이라 구조가 다르다.
- 모든 데이터를 HTML 안에 넣어 파일이 10MB다. 검색 색인만 2.2MB다. → API 또는 정적 JSON을 나눠 불러오고, 검색은 서버나 DB 전문 검색으로 바꾼다.
- 음성은 브라우저 TTS(Web Speech API)라 기기마다 음질이 다르다. → 미리 녹음한 음성 파일(클라우드 TTS로 한 번 생성해 CDN에 저장)로 바꾼다.
- 대결방은 가상 상대다. → 실시간 서버(예: Supabase Realtime).
- 로그인·결제·보호자 동의는 화면만 있다. → 실제 인증과 법정대리인 동의 절차가 필요하다.
