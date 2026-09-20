// ../bulletin/data.js → Supabase bulletins 테이블 upsert (service_role 키 필요)
//   SUPABASE_URL=… SUPABASE_SERVICE_KEY=… node scripts/push-bulletin.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// .env.push (SUPABASE_URL / SUPABASE_SERVICE_KEY) 가 있으면 읽는다 — 환경변수가 우선
try {
  const envFile = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../.env.push'), 'utf8');
  for (const line of envFile.split('\n')) { const m = /^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/.exec(line); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }
} catch {}
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) { console.error('SUPABASE_URL, SUPABASE_SERVICE_KEY 가 필요합니다 — app/.env.push 에 넣으세요 (WEEKLY.md)'); process.exit(1); }

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../bulletin/data.js'), 'utf8');
const window = {};
new Function('window', src)(window);
const data = window.BULLETIN;
const m = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/.exec(data.issue.date);
const issue = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

const r = await fetch(`${SUPABASE_URL}/rest/v1/bulletins`, {
  method: 'POST',
  headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
  body: JSON.stringify({ issue, data, published_at: new Date().toISOString() }),
});
if (!r.ok) { console.error('실패', r.status, await r.text()); process.exit(1); }
console.log(`주보 ${issue} 업로드 완료 (${data.sermon.title})`);
