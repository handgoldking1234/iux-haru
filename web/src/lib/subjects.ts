/** 과목·갈래 정의와 주색 — docs/05_ui_guide.md '색' */
/** 오늘 할 일 순서 (프로토타입 HGS PNAME) */
export const SUBJECT_KEYS = ['math', 'hanja', 'eng', 'kor', 'hist', 'sci', 'typ'] as const;
export type SubjectKey = (typeof SUBJECT_KEYS)[number];

export interface SubjectInfo {
  key: SubjectKey;
  name: string;
  color: string;
  soft: string;
  /** 과목 안 갈래 라인 탭 */
  tracks: { key: string; name: string }[];
  /** 슬라이드·단어장·검색 대상인지 (연산·타자 제외) */
  cards: boolean;
}

export const SUBJECTS: Record<SubjectKey, SubjectInfo> = {
  math: { key: 'math', name: '연산', color: '#F59F00', soft: '#FFF9CC', tracks: [], cards: false },
  hanja: {
    key: 'hanja', name: '한자', color: '#C2410C', soft: '#FDEDE4', cards: true,
    tracks: [{ key: 'school', name: '학교 필수' }, { key: 'grade', name: '급수별' }, { key: 'cjm', name: '천자문' }],
  },
  eng: { key: 'eng', name: '영단어', color: '#7C3AED', soft: '#F1EAFE', tracks: [], cards: true },
  kor: {
    key: 'kor', name: '국어', color: '#0B8A5F', soft: '#E2F5EE', cards: true,
    tracks: [{ key: 'mix', name: '섞어서' }, { key: 'vc', name: '어휘' }, { key: 'kr', name: '수업' }],
  },
  sci: {
    key: 'sci', name: '과학', color: '#4F46E5', soft: '#ECEBFE', cards: true,
    tracks: [
      { key: 'mix', name: '통합' }, { key: 'phy', name: '물리' }, { key: 'chem', name: '화학' },
      { key: 'bio', name: '생명' }, { key: 'earth', name: '지구' },
    ],
  },
  hist: {
    key: 'hist', name: '역사', color: '#8B5A2B', soft: '#F5ECE2', cards: true,
    tracks: [{ key: 'ko', name: '국사' }, { key: 'wo', name: '세계사' }],
  },
  typ: { key: 'typ', name: '타자', color: '#2563EB', soft: '#E8F0FE', tracks: [], cards: false },
};

/** 놀이터(홈) 주색 */
export const PLAY_COLOR = '#DB2777';

/** 메뉴·드롭다운·통계 순서 (프로토타입 셸 SUBJ, play SNAME) */
export const MENU_ORDER: SubjectKey[] = ['math', 'hanja', 'eng', 'hist', 'kor', 'sci', 'typ'];

export const isSubjectKey = (k: string): k is SubjectKey => (SUBJECT_KEYS as readonly string[]).includes(k);

/** 마지막으로 공부한 과목 (브라우저 저장 키, 프로토타입과 같음) */
export const LAST_SUBJECT = 'harugongbu-subject';
