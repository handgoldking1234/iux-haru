const { chromium } = require('playwright');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/pics.js', 'utf8').replace('const PIC', 'global.PIC'));
const html = '<html><body style="margin:0;background:#fff;color:#2b3a55;font:14px sans-serif;display:flex;flex-wrap:wrap;width:1100px">' +
  Object.entries(PIC).map(([k, v]) => `<div style="width:110px;text-align:center;padding:4px;box-sizing:border-box"><svg viewBox="0 0 64 64" width="96" height="96" style="background:#f3f5f9;overflow:hidden">${v}</svg><div>${k}</div></div>`).join('') + '</body></html>';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 800 } });
  await pg.setContent(html);
  await pg.screenshot({ path: __dirname + '/pics-sheet.png', fullPage: true });
  await b.close();
})();
