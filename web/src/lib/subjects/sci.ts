/* 과학 — prototype/build/sci.js. 물리·화학·생명·지구 + 통합(학교급마다 네 영역을 한 단원씩 번갈아).
   문제·객관식은 국어와 같은 방식, 개념 첫 장에 '먼저 알면 좋아요'와 핵심 원리 카드가 있다 */
import { RULES, EXAM_CAP, EXAM_PASS_N } from '../engine/rules';
import { KOR, setupTerms } from './kor';
import { esc } from './termq';
import type { SubjectDef, Track } from './types';

const LV = ['초등', '중등', '고등'];
const TRN: Record<string, string> = { mix: '통합', phy: '물리', chem: '화학', bio: '생명', earth: '지구' };
const LINK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link inl" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';

type Unit = Parameters<typeof setupTerms>[0][number] & { pr?: { h: string; b: string }[]; pre?: string };
const unitOf = (T: Track, id: string) => (T.items[id] as unknown as { unit: Unit }).unit;

const korInfo = KOR.infoHTML;

export const SCI: SubjectDef = {
  ...KOR,
  key: 'sci',
  tracks: TRN,
  defaultTrack: 'mix',
  areas: LV,
  tname: { dt: '용어 고르기', td: '설명 고르기', ox: 'OX 퀴즈', sp: '바른 표기 고르기', mc: '객관식', ord: '순서', yr: '연도' },
  setup: (data, tr) => {
    const HD = data as Record<string, { units: Unit[] }>;
    if (!HD.mix) {
      /* 통합 트랙은 실행할 때 만듦: 학교급마다 물리→화학→생명→지구를 한 단원씩 번갈아 (데이터 중복 없이) */
      const A = ['phy', 'chem', 'bio', 'earth'].filter((k) => HD[k]);
      const mu: Unit[] = [];
      [0, 1, 2].forEach((lv) => {
        const cols = A.map((k) => HD[k].units.filter((u) => u.lv === lv));
        let k = 0;
        const mx = Math.max(0, ...cols.map((c) => c.length));
        for (let i = 0; i < mx; i++) cols.forEach((c) => { if (c[i]) { k++; mu.push({ ...c[i], n: k }); } });
      });
      HD.mix = { units: mu };
    }
    const TR = HD[tr] && TRN[tr] ? tr : 'mix';
    return setupTerms(HD[TR].units, TR, (lv) => `과학 ${lv} 승급 평가`, (u, s) => { s.pr = u.pr || []; s.pre = u.pre || ''; });
  },
  infoHTML: (T, id) => korInfo(T, id).replace('<span class="ok">뜻 · 규칙</span>', '<span class="ok">뜻 · 원리</span>').replace('같은 단원에서 함께 익힐 말', '같은 단원에서 함께 익힐 용어'),
  conceptIntro: (T, s, trName) => {
    const u = unitOf(T, s.items[0]);
    return `<span class="lk">${trName} ${s.g} · ${s.n}단원 · ${esc(s.era)}</span><h2>${esc(s.title)}</h2>${s.pre ? `<p class="pre">${LINK_SVG}먼저 알면 좋아요: ${esc(s.pre)}</p>` : ''}<p class="sum">${esc(s.sum)}</p>
      ${(s.pr || []).length ? `<div class="prs"><span class="lk">핵심 원리</span>${s.pr!.map((x, k) => `<div class="pr"><b><em>${k + 1}</em>${esc(x.h)}</b><p>${esc(x.b)}</p></div>`).join('')}</div>` : ''}
      <div class="wl"><span class="lk">이번 단원 용어</span><div class="ders">${u.items.map((y) => `<span>${esc(y.t)}</span>`).join('')}</div></div>`;
  },
  conceptEnd: (s, gate, cap) => `<span class="lk">기억할 점</span><h2>원리로 이해하고 예로 기억해요</h2><p>용어만 외우기보다 '왜 그런지' 원리를 먼저 이해하고, 생활 속 예나 실험 장면과 연결하면 오래 기억돼요. 비슷한 개념은 짝을 지어 차이를 비교해 보세요.</p><p class="soft">${gate ? `이 단원은 ${cap}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 설명 보고 용어 고르기부터, 잘 맞히면 용어 보고 설명 고르기와 쉬운 객관식 → 시험형 객관식(보통·어려움)과 OX로 올라가요. 어려운 단계에서 연속 ${RULES.GOAL}문제를 맞히면 다음 단원이에요.` : '통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.'}</p>`,
  examIntro: (s, trName) => `<span class="lk">${trName} ${s.area} · 용어 ${s.items.length}개</span><h2>${s.name}</h2>
      <p>${trName} ${s.area} 단원의 용어 ${s.items.length}개와 객관식 ${(s.mcs || []).length}문제 가운데 ${RULES.EXAM_N}문제가 무작위로 나와요.</p>
      <p class="soft">${EXAM_PASS_N}개 이상 맞히면 다음 학교급이 열려요. ${EXAM_CAP}개를 틀리면 평가가 끝나고, 틀린 용어를 오답노트로 복습한 뒤 다시 도전해요.</p>`,
  // 프로토타입 문구는 국어 것을 복사한 채로 남아 있어 과학에 맞게 고쳤다
  homeNote: "통합은 학교급마다 물리·화학·생명·지구 단원이 한 단원씩 번갈아 나와요. 영역만 따로 공부할 수도 있어요(영역마다 진도 따로). 단원 안에서는 용어 고르기 → 설명 고르기·쉬운 객관식 → 시험형 객관식 순으로 올라가요. 한 단원에서 정해진 개수(초등 5 · 중등 6 · 고등 7개)를 틀리면 그 단원을 처음부터 다시 해요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 잠긴 단원도 '개념'으로 미리 볼 수 있어요.",
  appName: '과학하루',
  tabName: '과학',
  trkClass: 'trk tl5',
};
