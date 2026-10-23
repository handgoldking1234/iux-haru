/* 국어·과학·역사(hist.js 계열) 화면 문구·모양 — 다른 과목은 필요한 것만 바꾼다 */
import { EXAM_CAP, EXAM_PASS_N, RULES } from '../engine/rules';
import { esc } from './termq';
import type { SubjectUI } from './types';

export const DEFAULT_UI: SubjectUI = {
  intro: '개념 정리',
  qIcon: '개념',
  thing: '용어',
  autoNo: 3000,
  boardCls: 'board hb',
  ptagWrong: false,
  okMore: '정답이에요!',
  showYou: false,
  statTitle: '학교급별 정답률',
  todayText: (kid, tr) => `${kid}의 ${tr} 학습`,
  homeBtn: (tr) => `${tr}로`,
  learned: (T, stage, tr) => `${tr} ${T.stages.slice(0, stage).filter((s) => s.kind === 'unit').length}/${T.stages.filter((s) => s.kind === 'unit').length}단원`,
  unitTitle: (s) => (s.kind === 'exam' ? s.name : `${s.n}단원 ${esc(s.title)}`),
  nowTitle: (s) => (s.kind === 'exam' ? `<b>${s.name}</b>` : `<b>${s.name} ${esc(s.title)}</b><span class="pv">${esc(s.era)}</span>`),
  lockedSub: (s) => esc(s.era ?? ''),
  examSub: (s) => `${s.items.length}개 용어에서 ${RULES.EXAM_N}문제`,
  examStreak: () => `${RULES.EXAM_N}문제 중 ${EXAM_PASS_N}개 이상 맞히면 다음 학교급 · ${EXAM_CAP}개 틀리면 종료`,
  stepFirst: '개념 정리',
  stepHz: false,
};
