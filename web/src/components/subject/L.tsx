/* 과목 화면 아이콘 — 프로토타입 drawIcons()와 같은 SVG (lucide 0.469 데이터 그대로) */
import { LI } from '@/lib/protoIcons';

export default function L({ n, c }: { n: string; c?: string }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: LI(n, c) }} />;
}

/** 프로토타입이 문자열로 만든 HTML 조각 */
export const H = ({ html, as: As = 'div', className }: { html: string; as?: 'div' | 'span' | 'b'; className?: string }) => (
  <As className={className} style={className ? undefined : { display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
);
