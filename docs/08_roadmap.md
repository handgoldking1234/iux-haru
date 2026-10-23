# 08. 본개발 전환 계획과 남은 일

## 권장 스택 (평소 쓰는 구성 기준 — 확정은 사용자 결정)
- 프론트: Next.js(App Router) 웹 + PWA. 앱이 필요해지면 Expo로 감싸거나 다시 만든다.
- 백엔드: Supabase(Auth, Postgres, Realtime, Storage)
- 배포: Vercel. 우선 무료 플랜과 무료 서브도메인으로 시작한다(사용자 결정).
- 음성: 클라우드 TTS로 항목별 음성 파일을 **한 번 미리 만들어** Storage/CDN에 둔다. 사용량과 무관하게 비용이 거의 들지 않는다.

## DB 초안

| 테이블 | 주요 칼럼 |
| --- | --- |
| guardians | id(auth), email, 동의일시 |
| students | id, guardian_id, nickname, grade, avatar(jsonb) |
| subjects / tracks | key(math·hanja·eng·kor·sci·hist·typ), track(school·grade·cjm·vc·kr·phy…), 주색 |
| units | id, track, order, level, n, title, era, sum, pr(jsonb), pre |
| items | id, unit_id, type(char·word·term·phrase·mc), payload(jsonb), search_text |
| progress | student_id, track, stage, bp(jsonb), streak, wr(jsonb), read(jsonb) |
| passed_units | student_id, unit_id, box, due_unit, exam_score |
| wrong_cards | student_id, item_id, qtype, box, due_date, wrong_count |
| attempts | student_id, item_id, qtype, ok, ms, created_at (기록·통계·리포트 원천) |
| daily | student_id, date, ok, no, cash, game_cash, plays, bonus, plan(jsonb) |
| wallet | student_id, cash, xp, owned(jsonb), equipped(jsonb) |
| wordbook_cats / wordbook_items | student_id, name / cat_id, item_id |
| rooms / room_members | code, public, host, subject / 실시간 점수 |
| settings | guardian 설정(오늘 할 일 분량, 게임 1/3/5, 밤 잠금, 밀린 공부 잠금, 알림 시간) |

규칙 계산(진도·오답 간격·보상)은 `03_rules.md`대로 서버나 공용 모듈 한 곳에서만 한다. 지금처럼 과목마다 복제하지 않는다.

## 단계
1. **기반**: 데이터 JSON을 DB로 옮기는 마이그레이션 스크립트, 인증(보호자) + 자녀 프로필, 셸 레이아웃(`05_ui_guide.md`).
2. **공통 학습 엔진**: 진도·난이도·오답·복습·승급 평가 하나로 구현한다. 과목별 문제 생성기는 플러그인으로 붙인다. 프로토타입과 같은 결과가 나오는지 테스트로 맞춘다.
3. **과목 이식**: 한자(3갈래) → 영단어 → 연산 → 국어·과학·역사 → 타자.
4. **놀이터**: 캐시·XP·오늘 할 일·잠금·꾸미기 → 게임 → 대결방(Realtime) → 랭킹.
5. **슬라이드·단어장·검색**: 미리 만든 음성 파일, DB 전문 검색.
6. **운영**: 보호자 리포트, 결제, 알림(PWA 푸시), 관리자 콘텐츠 수정·오류 신고.

## 아직 안 한 것 (요청됐거나 제안된 것)
- [ ] 검색 결과에서 바로 슬라이드 카드 열기, ☆로 단어장에 담기 (제안함, 답 대기)
- [ ] 문제 풀이 화면·오답노트에서도 ☆로 단어장에 담기 (제안함, 답 대기)
- [ ] '공부하러 가기'를 그 단원·카드로 바로 이동
- [ ] 슬라이드 따라 읽기(음성 인식, 2단계). 미지원 브라우저에서는 '읽었어요' 버튼
- [ ] 슬라이드 보상(덱 완주 +1, 일일 상한 5)과 오늘 할 일 연동
- [ ] 보호자 리포트(주간 학습량·정답률·약점 단원)
- [ ] 스트릭 보호(캐시로 사는 하루 쉬기권), 오늘 목표 5·10·20분
- [ ] 주간 리그(비슷한 활동량 30명 단위)
- [ ] 첫 체험 문제 5개 → 가입(로그인 전 체험)
- [ ] PWA 오프라인·푸시 알림
- [ ] 학원·공부방 라이선스(숙제 배부·진도 대시보드)
- [ ] 콘텐츠 교사 검수, 오류 신고 버튼
- [ ] 연산·타자 검색 대상 추가 여부
- [ ] 데이터 라이선스 정리(`07_data.md` ⚠️ 항목)

## 열린 결정
- **앱 이름**: 「하루공부」 유지 여부. '하루'가 흔한 이름이라 고민 중이다. 여러 서비스를 묶을 회사·브랜드 이름도 검토 중이다.
- **요금**: 아래 세 안을 검토 중이다.
  - 사용자 안 A: 첫 가입자가 코드 3개를 받아 친구에게 주고, 준 코드 수만큼 과목을 무료로 연다(예: 1개면 연산+한자, 더 주면 영단어 추가).
  - 사용자 안 B: 한 과목 월 2만 원, 묶음 월 3만 원.
  - 수익성 조사 제안: 무료 기본 + 가족 구독 월 9,900원 / 연 79,000원 + 학원 라이선스. 광고는 넣지 않는다.
- **음성**: 브라우저 TTS를 그대로 쓸지, 미리 만든 클라우드 음성으로 바꿀지(권장).
- **대상 학년 우선순위**: 초등 우선은 확정. 중·고 콘텐츠 검수 순서는 미정.

## 참고 문서
- 슬라이드 학습 기획서(경쟁사 분석·기능 정의·로드맵): https://claude.ai/artifact/F99bSSC3sJmEPXErmFS9JW
- 수익성 조사(시장·가격·시나리오·리스크): https://claude.ai/artifact/FZNME8ybGcy1mEfrBy9YPz
- 최신 프로토타입: https://claude.ai/artifact/CmrQdFfAfqQqKbGuReQgiy
