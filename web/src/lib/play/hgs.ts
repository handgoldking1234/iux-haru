'use client';
/**
 * 프로토타입 놀이터 게임 코드(playApp.js)가 쓰는 공통 보상 저장소(HGS) — hgs.js와 같은 메서드를
 * 지금 앱의 보상 모듈(rewards.ts)과 학생별 저장소로 이어 준다.
 */
import { buddy } from '@/components/Buddy';
import {
  allDone, backlog, backlogTotal, block, dayNumber, ensureDay, gameEarn, gameLimit, gamesLeft, GAME_CAP, GRADES, gradeOf,
  MORE, rewardEvent, STUDY_CAP, takeTicket, tasks, todayDone, weekNumber, type RewardState,
} from '../rewards/rewards';
import { getRewards, setRewards } from '../store';
import { SUBJECT_KEYS, SUBJECTS, type SubjectKey } from '../subjects';

export function hgsFor(kid: string) {
  let st: RewardState = getRewards(kid);
  st.name = kid;
  const subs: (() => void)[] = [];
  const t = () => dayNumber(new Date());
  const save = () => { setRewards(kid, st); subs.forEach((f) => { try { f(); } catch { /* 화면 갱신 실패 무시 */ } }); };
  return {
    GRADES: GRADES.map((g) => ({ n: g.n, x: g.x, ic: g.icon })), MORE, GAME_CAP, STUDY_CAP,
    PNAME: Object.fromEntries(SUBJECT_KEYS.map((k) => [k, SUBJECTS[k].name])),
    dayN: t, wkN: weekNumber,
    get st() { return st; },
    reload() { st = getRewards(kid); st.name = kid; },
    save,
    on(f: () => void) { subs.push(f); },
    off(f: () => void) { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); },
    day: () => { const d = ensureDay(st, t()); return Object.assign(d, { by_no: d.byNo }); },
    backlog: () => backlog(st, t()).map((b) => ({ ...b, name: SUBJECTS[b.k].name })),
    backTotal: () => backlogTotal(st, t()),
    gradeOf,
    gEarn: (n: number) => gameEarn(st, t(), n),
    limit: () => gameLimit(st, t()),
    left: () => gamesLeft(st, t()),
    tasks: () => tasks(st, t()),
    planTotal: () => tasks(st, t()).reduce((a, x) => a + x.goal, 0),
    todayDone: () => todayDone(st, t()),
    done: () => allDone(st, t()),
    block: () => block(st, new Date()),
    useTicket: () => { const ok = takeTicket(st, new Date()); if (ok) save(); return ok; },
    event: (e: 'ok' | 'no' | 'pass' | 'grad', s: SubjectKey) => { const o = rewardEvent(st, e, s, t()); save(); buddy(e === 'ok' ? 'ok' : e === 'no' ? 'no' : 'win'); return o; },
  };
}
