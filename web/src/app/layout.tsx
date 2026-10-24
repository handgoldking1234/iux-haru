import type { Metadata, Viewport } from 'next';
import '@/styles/proto/shell.css';
import '@/styles/proto/play.css';
import '@/styles/proto/sub.css';
import '@/styles/proto/math.css';
import '@/styles/math-extra.css';
import './globals.css';

export const metadata: Metadata = {
  title: '하루공부',
  description: '매일 조금씩, 기초를 튼튼하게',
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
