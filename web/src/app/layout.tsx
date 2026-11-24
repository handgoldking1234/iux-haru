import type { Metadata, Viewport } from 'next';
import '@/styles/proto/shell.css';
import '@/styles/proto/play.css';
import '@/styles/proto/sub.css';
import '@/styles/proto/math.css';
import '@/styles/math-extra.css';
import '@/styles/sub-extra.css';
import '@/styles/play-extra.css';
import './globals.css';

const SITE_URL = 'https://maeilssuk.iux.kr';
const DESCRIPTION =
  '매일쑥은 초등~고등 학생이 매일 조금씩, 틀린 문제를 반복해서 기초를 다지는 학습 앱이에요. 연산·한자(천자문)·영단어·국어·과학·역사·타자 7과목을 하루 한 번에 공부해요.';

// 검색 사이트 소유 확인 코드 (구글 서치 콘솔 · 네이버 서치어드바이저)
const GOOGLE_SITE_VERIFICATION = 'tso9qYImLnFitQTmG2e4H1qN72WmzN3-xzgiDQq4D8c';
const NAVER_SITE_VERIFICATION = '';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: '매일쑥 - 매일 조금씩, 기초를 튼튼하게', template: '%s | 매일쑥' },
  description: DESCRIPTION,
  applicationName: '매일쑥',
  keywords: ['매일쑥', '초등 학습', '연산', '한자', '천자문', '영단어', '국어', '과학', '역사', '타자', '오답 복습', '공부 습관'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: '매일쑥',
    locale: 'ko_KR',
    title: '매일쑥 - 매일 조금씩, 기초를 튼튼하게',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    ...(NAVER_SITE_VERIFICATION ? { other: { 'naver-site-verification': NAVER_SITE_VERIFICATION } } : {}),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@500;700&family=Nunito:wght@600;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
