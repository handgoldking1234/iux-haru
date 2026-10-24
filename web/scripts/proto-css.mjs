/**
 * 프로토타입 CSS → src/styles/proto/*.css
 * 프로토타입은 셸 안에 화면마다 iframe을 띄워 CSS가 섞이지 않았다.
 * 여기서는 원본 CSS를 고치지 않고, 화면별 범위(.pg-play 등)만 씌워 같은 결과를 낸다.
 *   shell.css  shell.html <style> 그대로 (전역)
 *   play.css   play.css → .pg-play 안으로 (html·body·:root는 .pg-play 자신)
 * 실행: npm run proto-css
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.resolve(here, '../../prototype/build');
const OUT = path.resolve(here, '../src/styles/proto');
fs.mkdirSync(OUT, { recursive: true });

const head = '/* 자동 생성 — scripts/proto-css.mjs. 직접 고치지 말고 원본(prototype/build) 기준으로 다시 만든다 */\n';

function scope(css, cls) {
  return postcss([
    prefixer({
      prefix: `.${cls}`,
      transform(prefix, selector, prefixed) {
        // 문서 뿌리는 범위 요소 자신
        if (/^(html|body|:root)$/.test(selector)) return prefix;
        const m = selector.match(/^(html|body|:root)([\s>:.[].*)$/);
        if (m) return `${prefix}${m[2].startsWith(' ') || m[2].startsWith('>') ? m[2] : m[2]}`;
        return prefixed;
      },
    }),
  ]).process(css, { from: undefined }).css;
}

// 셸
const shell = fs.readFileSync(path.join(B, 'shell.html'), 'utf8');
const shellCss = shell.slice(shell.indexOf('<style>') + 7, shell.indexOf('</style>'));
// 셸 규칙이 화면(.pg) 안쪽에는 닿지 않게: 맨 끝 요소에 :not(.pg *)를 붙인다 (iframe이 하던 일)
const guard = postcss([{
  postcssPlugin: 'guard',
  Rule(rule) {
    if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map((sel) => {
      if (/^(html|body|:root|\*)$/.test(sel.trim()) || /^(html|body)[\s,]/.test(sel.trim())) return sel;
      const m = sel.match(/^(.*?)(::?(?:before|after|placeholder|-webkit-scrollbar)[\w-]*)?$/);
      return `${m[1]}:not(.pg *)${m[2] ?? ''}`;
    });
  },
}]);
// 검색 창 (build.py가 셸 문서에 덧붙임) — .src(지우기 단추) 등이 연산 배지에 새지 않게 같이 막는다
const searchCss = fs.readFileSync(path.join(B, 'search.css'), 'utf8');
fs.writeFileSync(path.join(OUT, 'shell.css'), head + guard.process(shellCss + '\n' + searchCss, { from: undefined }).css);

// 놀이터
const play = fs.readFileSync(path.join(B, 'play.css'), 'utf8');
fs.writeFileSync(path.join(OUT, 'play.css'), head + scope(play, 'pg-play'));

// 과목 화면 (한자·영단어·국어·과학·역사·타자) — build.py app() + fix()와 같은 순서:
//   head.html <style>들 → extra.css(마지막 </style> 앞) → theme(k) → NAVHOOK → slide.css
const headHtml = fs.readFileSync(path.join(B, 'head.html'), 'utf8');
const styles = [...headHtml.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
const extra = fs.readFileSync(path.join(B, 'extra.css'), 'utf8').replace('.hanja-note{}\n', '');
const buildPy = fs.readFileSync(path.join(B, 'build.py'), 'utf8');
const navI = buildPy.indexOf("NAVHOOK='<style>") + "NAVHOOK='<style>".length;
const navhook = buildPy.slice(navI, buildPy.indexOf('</style>', navI));
// theme(k): 주색 변수는 과목별 클래스(.s-hist 등)로, 나머지 규칙은 공통
const COL = { math: ['#2563EB', '#E8F0FE'], hanja: ['#C2410C', '#FDEDE4'], eng: ['#7C3AED', '#F1EAFE'], hist: ['#8B5A2B', '#F5ECE2'], kor: ['#0B8A5F', '#E2F5EE'], sci: ['#4F46E5', '#ECEBFE'], typ: ['#0E7490', '#E0F2F6'] };
const themeRest = 'body{background:#fff!important;padding-top:6px!important}@media (max-width:520px){body{padding-top:0!important}}#bar{order:0}nav#tabs{order:1}#screen{order:2}nav#tabs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:10px 16px 12px;background:var(--paper);border-top:0;border-bottom:1px solid var(--line)}nav#tabs::-webkit-scrollbar{display:none}nav#tabs[hidden]{display:none}nav#tabs button{flex:none;flex-direction:row;gap:6px;border:1.5px solid var(--line);border-radius:99px;padding:7px 15px;font-size:15px;font-weight:800;color:var(--fg);background:var(--paper)}nav#tabs .tb{display:none}nav#tabs button.on{background:#1E2421;border-color:#1E2421;color:#fff;font-weight:800}nav#tabs .dot{position:static;height:auto;min-width:20px;border-radius:99px;background:#FF4F1F;font-size:12px;line-height:1;padding:3px 7px}@media (min-width:700px){nav#tabs{padding:10px 24px 14px}}';
const slide = fs.readFileSync(path.join(B, 'slide.css'), 'utf8');
let subCss = [...styles.slice(0, -1), styles.at(-1) + extra].join('\n') + '\n' + themeRest + '\n' + navhook + '\n' + slide;
subCss = scope(subCss, 'pg-sub');
subCss += '\n' + Object.entries(COL).map(([k, [c, s]]) => `.pg-sub.s-${k}{--y:${c};--y2:${c};--y-soft:${s};--bg:#F4F5F7;--hi:#E8EBF0;--line:#E1E4EA}`).join('\n');
fs.writeFileSync(path.join(OUT, 'sub.css'), head + subCss);

// 연산 — math.html <style>들 + theme('math') + NAVHOOK (build.py fix('math'))
const mathHtml = fs.readFileSync(path.join(B, 'math.html'), 'utf8');
const mstyles = [...mathHtml.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
let mathCss = mstyles.join('\n') + '\n' + themeRest + '\n' + navhook;
mathCss = scope(mathCss, 'pg-math') + `\n.pg-math{--y:${COL.math[0]};--y2:${COL.math[0]};--y-soft:${COL.math[1]};--bg:#F4F5F7;--hi:#E8EBF0;--line:#E1E4EA}`;
fs.writeFileSync(path.join(OUT, 'math.css'), head + mathCss);

console.log('→', path.relative(path.resolve(here, '..'), OUT), fs.readdirSync(OUT));
