/* 하루공부 심볼 — 새싹이 난 얼굴 (로그인 화면) */
export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <circle cx="24" cy="27" r="16" fill="#FFE3A3" />
      <path d="M24 11v-5" stroke="#3E9B5B" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M24 7q-7-7-12-2 5 6 12 2z" fill="#5BC27A" />
      <path d="M24 6q7-8 13-3-6 7-13 3z" fill="#6FD68C" />
      <circle cx="19" cy="26" r="2" fill="#2B2F36" />
      <circle cx="29" cy="26" r="2" fill="#2B2F36" />
      <path d="M21 31q3 3 6 0" stroke="#2B2F36" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
