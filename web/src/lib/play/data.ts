/* 놀이터 데이터 — prototype/build/play.js 177~195줄, 709~710줄, 864~870줄.
   친구는 시연용 예시 닉네임이다. 실제 랭킹·대결방은 서버(Supabase)로 바꾼다. */
import { weekNumber, type Equip, type RewardState } from '../rewards/rewards';

export interface Friend {
  id: string;
  name: string;
  eq: Partial<Equip>;
  skill: number;
  spd: [number, number];
  seed: number;
}

export const FRIENDS: Friend[] = [
  { id: 'f1', name: '별빛토끼', eq: { body: 'peach', hat: 'ribbon', face: 'basic', outfit: 'none', bg: 'sunset' }, skill: 0.86, spd: [2.2, 5.5], seed: 41 },
  { id: 'f2', name: '구구단마스터', eq: { body: 'sky', hat: 'cap', face: 'glasses', outfit: 'bow', bg: 'dots' }, skill: 0.9, spd: [1.8, 4.5], seed: 73 },
  { id: 'f3', name: '한자왕콩이', eq: { body: 'mint', hat: 'beanie', face: 'basic', outfit: 'scarf', bg: 'none' }, skill: 0.78, spd: [2.6, 6], seed: 19 },
  { id: 'f4', name: '영어고래', eq: { body: 'lav', hat: 'sprout', face: 'sun', outfit: 'none', bg: 'dots' }, skill: 0.72, spd: [3, 6.5], seed: 58 },
  { id: 'f5', name: '역사탐험가', eq: { body: 'cream', hat: 'wizard', face: 'basic', outfit: 'cape', bg: 'night' }, skill: 0.82, spd: [2.4, 6], seed: 90 },
  { id: 'f6', name: '맞춤법요정', eq: { body: 'peach', hat: 'sprout', face: 'glasses', outfit: 'scarf', bg: 'none' }, skill: 0.66, spd: [3.2, 7], seed: 27 },
  { id: 'f7', name: '키보드고양이', eq: { body: 'cream', hat: 'sprout', face: 'sun', outfit: 'bow', bg: 'dots' }, skill: 0.8, spd: [2.4, 5.8], seed: 64 },
  { id: 'f8', name: '초록거북', eq: { body: 'mint', hat: 'cap', face: 'basic', outfit: 'none', bg: 'none' }, skill: 0.62, spd: [3.4, 7.5], seed: 35 },
  { id: 'f9', name: '하늘다람쥐', eq: { body: 'sky', hat: 'beanie', face: 'basic', outfit: 'scarf', bg: 'sunset' }, skill: 0.76, spd: [2.6, 6.2], seed: 52 },
  { id: 'f10', name: '달빛여우', eq: { body: 'peach', hat: 'ribbon', face: 'glasses', outfit: 'none', bg: 'night' }, skill: 0.88, spd: [2, 5], seed: 81 },
];

/** 게임 과목 (스피드·대결방) */
export const GSUBJ: Record<string, [string, string]> = {
  mix: ['종합', '#DB2777'], math: ['연산', '#CA8A04'], gugu: ['구구단', '#CA8A04'], hanja: ['한자', '#C2410C'],
  eng: ['영단어', '#7C3AED'], hist: ['역사', '#8B5A2B'], kor: ['국어', '#0B8A5F'], sci: ['과학', '#4F46E5'],
  spell: ['맞춤법', '#0B8A5F'], tko: ['한글 타자', '#0E7490'], ten: ['영문 타자', '#0E7490'],
};
export const DANS: [number, string][] = [[0, '전체'], [2, '2단'], [3, '3단'], [4, '4단'], [5, '5단'], [6, '6단'], [7, '7단'], [8, '8단'], [9, '9단']];
export const danName = (d: number) => (d ? `${d}단` : '전체');
export const bestKey = (sub: string, dan: number) => (sub === 'gugu' ? 'gugu' + (dan || 0) : sub);

/** 공개 방 목록(시연): 날마다 바뀌는 가상 방 3개 */
export function pubRooms(today: number) {
  const subs = Object.keys(GSUBJ);
  return [0, 1, 2].map((i) => {
    const h = FRIENDS[(today + i * 3) % FRIENDS.length], max = [3, 4, 6][i];
    return { host: h, sub: subs[(today * 7 + i * 5) % subs.length], n: [10, 15, 20][(today + i) % 3], max, cur: 1 + ((today + i) % (max - 1)) };
  });
}

export type RankMode = 'week' | 'total' | 'wins' | 'typ';

export function friendVal(f: Friend, mode: RankMode, today: number) {
  const dow = (today + 3) % 7, s = f.seed;
  if (mode === 'week') return Math.round(s * 0.6 + (dow + 1) * (18 + (s % 23)));
  if (mode === 'total') return 300 + ((s * 31) % 2900);
  if (mode === 'typ') return 110 + ((s * 37) % 320);
  return s % 13;
}

export function myVal(st: RewardState, mode: RankMode, today: number) {
  return mode === 'week' ? st.wk[weekNumber(today)] ?? 0 : mode === 'total' ? st.xp : mode === 'typ' ? st.typCpm ?? 0 : st.wins ?? 0;
}

export function myRank(st: RewardState, mode: RankMode, today: number) {
  const me = myVal(st, mode, today);
  return 1 + FRIENDS.filter((f) => friendVal(f, mode, today) > me).length;
}
