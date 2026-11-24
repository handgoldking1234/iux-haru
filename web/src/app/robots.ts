import type { MetadataRoute } from 'next';

// 검색에는 첫 화면·로그인만 보이게 한다. 학생 화면·관리자·API는 로그인 뒤라 수집하지 않는다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: ['/admin', '/api', '/auth', '/home', '/study', '/game', '/rank', '/my', '/kids'],
      },
    ],
    sitemap: 'https://maeilssuk.iux.kr/sitemap.xml',
    host: 'https://maeilssuk.iux.kr',
  };
}
